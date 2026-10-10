import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileText, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResumeUploader } from '@/components/resume/ResumeUploader'
import { ResumeCard } from '@/components/resume/ResumeCard'
import { deleteResume, fetchMyResumes, selectSortedResumes } from '@/store/resumeSlice'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Resumes() {
  useDocumentTitle('My resumes')

  const dispatch = useDispatch()
  const toast = useToast()

  const resumes = useSelector(selectSortedResumes)
  const { status, error } = useSelector((state) => state.resumes)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(fetchMyResumes())
  }, [dispatch])

  async function onConfirmDelete() {
    setDeleting(true)
    const result = await dispatch(deleteResume(pendingDelete.id))
    setDeleting(false)

    if (deleteResume.fulfilled.match(result)) {
      toast.success('Resume deleted', `${pendingDelete.fileName} was removed.`)
      setPendingDelete(null)
    } else {
      toast.error('Could not delete', result.payload)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="My resumes"
        description="Upload the versions you apply with. Your primary resume is attached by default."
      />

      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <ResumeUploader isFirstResume={resumes.length === 0} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Uploaded resumes{resumes.length > 0 ? ` (${resumes.length})` : ''}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {status === 'loading' &&
            Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-[74px] w-full rounded-xl" />
            ))}

          {status === 'failed' && (
            <ErrorState message={error} onRetry={() => dispatch(fetchMyResumes())} />
          )}

          {status === 'succeeded' && resumes.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No resumes uploaded yet"
              description="Upload a PDF or DOCX above. You need at least one to apply for a role."
            />
          )}

          {status === 'succeeded' &&
            resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onDelete={setPendingDelete} />
            ))}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          The text of each resume is extracted on upload so it can be compared against job
          descriptions. Employers can see a resume as part of reviewing an application you sent
          them. Marking a different resume as primary is done at upload time.
        </p>
      </div>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this resume?"
        description={
          pendingDelete
            ? `${pendingDelete.fileName} will be removed, along with the text extracted from it. Applications you already sent keep their match score.`
            : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
            <Button variant="destructive" loading={deleting} onClick={onConfirmDelete}>
              Delete resume
            </Button>
          </>
        }
      />
    </div>
  )
}
