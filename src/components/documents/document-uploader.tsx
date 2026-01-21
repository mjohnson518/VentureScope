'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/msword': ['.doc'],
  'text/csv': ['.csv'],
  'text/plain': ['.txt'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface FileWithProgress {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

interface DocumentUploaderProps {
  companyId: string
  onUploadComplete?: (documentIds: string[]) => void
}

export function DocumentUploader({ companyId, onUploadComplete }: DocumentUploaderProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      toast.error('Some files were rejected. Please check file type and size.')
    }

    // Add accepted files to state
    const newFiles: FileWithProgress[] = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: 'pending' as const,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    const uploadedIds: string[] = []

    for (const fileItem of pendingFiles) {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f
          )
        )

        // Create form data
        const formData = new FormData()
        formData.append('file', fileItem.file)
        formData.append('companyId', companyId)

        // Upload file
        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()

        // Update progress during upload (simulated for now)
        for (let progress = 0; progress <= 100; progress += 20) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, progress } : f
            )
          )
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Update status to processing
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'processing' as const } : f
          )
        )

        // Trigger document processing
        await fetch('/api/documents/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: data.id }),
        })

        // Update status to complete
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'complete' as const } : f
          )
        )

        uploadedIds.push(data.id)
      } catch (error) {
        // Update status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: 'error' as const, error: 'Upload failed' }
              : f
          )
        )
        toast.error(`Failed to upload ${fileItem.file.name}`)
      }
    }

    setIsUploading(false)

    if (uploadedIds.length > 0) {
      toast.success(`${uploadedIds.length} file(s) uploaded successfully`)
      onUploadComplete?.(uploadedIds)
    }
  }

  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing...'
      case 'complete':
        return 'Complete'
      case 'error':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-primary font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="font-medium">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          PDF, Word, Excel, PowerPoint, CSV, Images, Videos (max 50MB each)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
            >
              {getStatusIcon(fileItem.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileItem.file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(fileItem.file.size)}</span>
                  <span>•</span>
                  <span>{getStatusText(fileItem.status)}</span>
                </div>
                {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
                  <Progress value={fileItem.progress} className="h-1 mt-2" />
                )}
              </div>
              {fileItem.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeFile(fileItem.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {pendingCount > 0 && (
        <Button
          onClick={uploadFiles}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
