import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Trash2,
  Building2,
  Calendar,
  HardDrive,
  FileType,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSignedUrl } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DocumentActions } from './document-actions'

interface DocumentPageProps {
  params: Promise<{ id: string }>
}

const classificationLabels: Record<string, string> = {
  pitch_deck: 'Pitch Deck',
  financials: 'Financials',
  cap_table: 'Cap Table',
  legal: 'Legal',
  product_demo: 'Product Demo',
  founder_video: 'Founder Video',
  customer_reference: 'Customer Reference',
  other: 'Other',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.orgId) {
    return { title: 'Document - VentureScope' }
  }

  const supabase = createAdminClient()
  const { data: document } = await supabase
    .from('documents')
    .select('file_name, companies!inner(org_id)')
    .eq('id', id)
    .eq('companies.org_id', session.user.orgId)
    .single()

  return {
    title: document ? `${document.file_name} - VentureScope` : 'Document - VentureScope',
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    notFound()
  }

  const supabase = createAdminClient()
  const { data: document, error } = await supabase
    .from('documents')
    .select(`
      *,
      companies!inner(id, name, org_id)
    `)
    .eq('id', id)
    .eq('companies.org_id', session.user.orgId)
    .single()

  if (error || !document) {
    notFound()
  }

  // Get signed URL for download
  let downloadUrl: string | null = null
  if (document.file_url) {
    try {
      downloadUrl = await getSignedUrl(document.file_url)
    } catch (err) {
      console.error('Error getting signed URL:', err)
    }
  }

  const company = document.companies as { id: string; name: string; org_id: string }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/companies/${company.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight truncate max-w-xl">
              {document.file_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Link
                href={`/dashboard/companies/${company.id}`}
                className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
              >
                <Building2 className="h-3 w-3" />
                {company.name}
              </Link>
              {document.classification && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <Badge variant="outline">
                    {classificationLabels[document.classification] || document.classification}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        <DocumentActions documentId={id} downloadUrl={downloadUrl} />
      </div>

      {/* Document Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileType className="h-4 w-4" />
              Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{document.file_type.split('/').pop()?.toUpperCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatFileSize(document.file_size || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {format(new Date(document.created_at), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {document.processed_at ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : document.error_message ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                document.processed_at
                  ? 'default'
                  : document.error_message
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {document.processed_at
                ? 'Processed'
                : document.error_message
                  ? 'Failed'
                  : 'Processing'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Error message if processing failed */}
      {document.error_message && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Processing Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{document.error_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Extracted Text */}
      {document.extracted_text && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Content</CardTitle>
            <CardDescription>
              Text extracted from the document for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {document.extracted_text}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Preview (for supported types) */}
      {downloadUrl && document.file_type === 'application/pdf' && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={`${downloadUrl}#toolbar=0`}
              className="w-full h-[600px] border rounded-lg"
              title={document.file_name}
            />
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {document.metadata && Object.keys(document.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted/50 rounded-lg p-4 overflow-x-auto">
              {JSON.stringify(document.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Footer timestamps */}
      <p className="text-xs text-muted-foreground">
        Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
        {document.processed_at && (
          <> · Processed {formatDistanceToNow(new Date(document.processed_at), { addSuffix: true })}</>
        )}
      </p>
    </div>
  )
}
