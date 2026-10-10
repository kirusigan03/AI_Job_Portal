import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ArrowLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/layout/PageHeader'
import { createJob } from '@/store/jobSlice'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { EXPERIENCE_OPTIONS, JOB_TYPES } from '@/utils/constants'
import { humanize } from '@/utils/format'

const EMPTY = {
  title: '',
  description: '',
  companyName: '',
  location: '',
  salaryMin: '',
  salaryMax: '',
  experienceRequired: '',
  jobType: 'FULL_TIME',
}

export default function CreateJob() {
  useDocumentTitle('Post a job')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const titleInvalid = touched && !form.title.trim()
  const descriptionInvalid = touched && !form.description.trim()
  const salaryInvalid =
    touched &&
    form.salaryMin &&
    form.salaryMax &&
    Number(form.salaryMin) > Number(form.salaryMax)

  function field(name) {
    return {
      id: name,
      value: form[name],
      onChange: (event) => setForm({ ...form, [name]: event.target.value }),
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    setTouched(true)

    if (!form.title.trim() || !form.description.trim()) return
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      return
    }

    setSaving(true)

    // employerId is taken from the JWT by job-service and is never sent here.
    const result = await dispatch(
      createJob({
        title: form.title.trim(),
        description: form.description.trim(),
        companyName: form.companyName.trim() || null,
        location: form.location.trim() || null,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        experienceRequired: form.experienceRequired || null,
        jobType: form.jobType,
      }),
    )

    setSaving(false)

    if (createJob.fulfilled.match(result)) {
      toast.success('Job published', `${result.payload.title} is live and accepting applications.`)
      navigate('/employer/jobs')
    } else {
      toast.error('Could not publish the job', result.payload)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/employer/jobs"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My jobs
      </Link>

      <PageHeader
        title="Post a job"
        description="Candidates see this exactly as you write it, and their resumes are scored against it."
      />

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>The role</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="title" className="mb-1.5" required>
                Job title
              </Label>
              <Input
                {...field('title')}
                invalid={titleInvalid}
                placeholder="Senior Backend Engineer"
              />
              {titleInvalid && (
                <p className="mt-1.5 text-sm text-destructive">Give the role a title.</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="mb-1.5" required>
                Description
              </Label>
              <Textarea
                {...field('description')}
                invalid={descriptionInvalid}
                maxLength={5000}
                className="min-h-[220px]"
                placeholder={
                  'What the role involves, the team, and the skills and experience required.\n\nBe specific about technologies: the resume match score is calculated against this text.'
                }
              />
              <div className="mt-1.5 flex items-center justify-between gap-3">
                {descriptionInvalid ? (
                  <p className="text-sm text-destructive">Describe the role.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Naming required skills explicitly produces a more useful match score.
                  </p>
                )}
                <p className="shrink-0 text-xs text-muted-foreground">
                  {form.description.length} / 5000
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyName" className="mb-1.5">
                  Company name
                </Label>
                <Input {...field('companyName')} placeholder="Northwind Technologies" />
              </div>
              <div>
                <Label htmlFor="location" className="mb-1.5">
                  Location
                </Label>
                <Input {...field('location')} placeholder="Colombo, or Remote" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="jobType" className="mb-1.5" required>
                  Job type
                </Label>
                <Select {...field('jobType')}>
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {humanize(type)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="experienceRequired" className="mb-1.5">
                  Experience required
                </Label>
                <Select {...field('experienceRequired')}>
                  <option value="">Not specified</option>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="salaryMin" className="mb-1.5">
                  Salary minimum
                </Label>
                <Input
                  {...field('salaryMin')}
                  type="number"
                  min="0"
                  step="1000"
                  invalid={Boolean(salaryInvalid)}
                  placeholder="60000"
                />
              </div>
              <div>
                <Label htmlFor="salaryMax" className="mb-1.5">
                  Salary maximum
                </Label>
                <Input
                  {...field('salaryMax')}
                  type="number"
                  min="0"
                  step="1000"
                  invalid={Boolean(salaryInvalid)}
                  placeholder="90000"
                />
              </div>
            </div>

            {salaryInvalid && (
              <p className="text-sm text-destructive">
                The maximum salary must be at least the minimum.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            New jobs are published as active and appear on the public job board straight away. You
            can close or delete a role from the My jobs page at any time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving}>
            Publish job
          </Button>
          <Link to="/employer/jobs">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
