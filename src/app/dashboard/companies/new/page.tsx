import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyForm } from '@/components/companies/company-form'

export const metadata: Metadata = {
  title: 'Add Company - VentureScope',
  description: 'Add a new company to your pipeline',
}

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Company</h1>
          <p className="text-muted-foreground">
            Add a new company to evaluate for investment
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Enter the basic information about the company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
