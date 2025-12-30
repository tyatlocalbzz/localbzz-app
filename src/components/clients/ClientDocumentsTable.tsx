import { format } from 'date-fns'
import { Download, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getTranscriptDownloadUrl, type DocumentTask } from '@/hooks/useClientDocuments'

interface ClientDocumentsTableProps {
  documents: DocumentTask[]
  isLoading?: boolean
}

const TASK_TYPE_LABELS: Record<string, string> = {
  shoot: 'Shoot',
  deliverable: 'Deliverable',
  meeting: 'Meeting',
  milestone: 'Milestone',
  opportunity: 'Opportunity',
}

export function ClientDocumentsTable({ documents, isLoading }: ClientDocumentsTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading documents...
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <FileText className="mx-auto h-12 w-12 opacity-50 mb-4" />
        <p className="font-medium">No documents found</p>
        <p className="text-sm">Upload transcripts or documents to tasks to see them here.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Context</TableHead>
          <TableHead>Filename</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => {
          const filename = doc.transcript_path.split('/').pop() || 'Unknown file'
          const downloadUrl = getTranscriptDownloadUrl(doc.transcript_path)
          const dateDisplay = doc.due_date
            ? format(new Date(doc.due_date), 'MMM d, yyyy')
            : 'No date'

          return (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                {dateDisplay}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium truncate max-w-[200px]">{doc.title}</span>
                  <Badge variant="outline" className="w-fit text-xs">
                    {TASK_TYPE_LABELS[doc.task_type] || doc.task_type}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[180px] text-sm">{filename}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a
                      href={downloadUrl}
                      download={filename}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
