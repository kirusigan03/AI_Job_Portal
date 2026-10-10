import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileText, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { clearUploadState, uploadResume } from '@/store/resumeSlice'
import { useToast } from '@/hooks/useToast'
import { ACCEPTED_RESUME_TYPES, MAX_RESUME_BYTES } from '@/utils/constants'
import { formatFileSize } from '@/utils/format'
import { cn } from '@/lib/utils'

/** The same limits resume-service enforces, checked before the request goes out. */
function validate(file) {
  if (!file) return 'Choose a file to upload.'

  const isAccepted =
    ACCEPTED_RESUME_TYPES.includes(file.type) || /\.(pdf|doc|docx)$/i.test(file.name)

  if (!isAccepted) return 'That file type is not supported. Upload a PDF, DOC, or DOCX.'
  if (file.size > MAX_RESUME_BYTES) return `That file is ${formatFileSize(file.size)}. The limit is 5MB.`

  return null
}

export function ResumeUploader({ isFirstResume = false, onUploaded }) {
  const dispatch = useDispatch()
  const toast = useToast()
  const inputRef = useRef(null)

  const { uploadStatus, uploadProgress } = useSelector((state) => state.resumes)

  const [file, setFile] = useState(null)
  const [primary, setPrimary] = useState(isFirstResume)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)

  const uploading = uploadStatus === 'loading'

  function selectFile(nextFile) {
    const message = validate(nextFile)
    setError(message)
    setFile(message ? null : nextFile)
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    if (uploading) return
    selectFile(event.dataTransfer.files?.[0])
  }

  async function onUpload() {
    if (!file) {
      setError('Choose a file to upload.')
      return
    }

    const result = await dispatch(uploadResume({ file, primaryResume: primary }))

    if (uploadResume.fulfilled.match(result)) {
      toast.success('Resume uploaded', `${file.name} is ready to attach to applications.`)
      setFile(null)
      setPrimary(false)
      if (inputRef.current) inputRef.current.value = ''
      dispatch(clearUploadState())
      onUploaded?.(result.payload)
    } else {
      toast.error('Upload failed', result.payload)
      setError(result.payload)
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!uploading) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
          dragging ? 'border-primary bg-primary-soft' : 'border-border bg-muted/40',
          uploading && 'opacity-70',
        )}
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
          <Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </span>

        <h3 className="mt-4 text-sm font-semibold text-foreground">Upload your resume</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag a file here, or browse. PDF, DOC, or DOCX, maximum 5MB.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          id="resume-file-input"
          disabled={uploading}
          onChange={(e) => selectFile(e.target.files?.[0])}
        />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
          <Button type="button" size="sm" loading={uploading} disabled={!file} onClick={onUpload}>
            {uploading ? 'Uploading' : 'Upload resume'}
          </Button>
        </div>
      </div>

      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          {!uploading && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setFile(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {uploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} label="Upload progress" />
          <p className="mt-2 text-xs text-muted-foreground">{uploadProgress}% uploaded</p>
        </div>
      )}

      <div className="mt-4">
        <Checkbox
          id="primary-resume"
          checked={primary}
          disabled={uploading}
          onChange={(e) => setPrimary(e.target.checked)}
          label="Make this my primary resume"
          description="Your primary resume is attached by default when you apply."
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
