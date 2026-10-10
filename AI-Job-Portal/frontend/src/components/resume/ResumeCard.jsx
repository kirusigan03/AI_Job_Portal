import { FileText, Star, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/format'
import { cn } from '@/lib/utils'

export function ResumeCard({ resume, onDelete, onSelect, selected = false, selectable = false }) {
  const Wrapper = selectable ? 'button' : 'div'

  return (
    <Wrapper
      {...(selectable
        ? { type: 'button', onClick: () => onSelect?.(resume), 'aria-pressed': selected }
        : {})}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left shadow-card transition-colors',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border',
        selectable && 'hover:border-slate-300',
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
        <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{resume.fileName}</p>
          {resume.primaryResume && (
            <Badge variant="primary" size="sm">
              <Star className="h-3 w-3" aria-hidden="true" />
              Primary
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {resume.fileType?.toUpperCase() || 'FILE'} · Uploaded {formatDate(resume.uploadedAt)}
        </p>
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(resume)
          }}
          aria-label={`Delete ${resume.fileName}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </Wrapper>
  )
}
