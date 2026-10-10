import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import userApi from '@/api/userApi'
import { getErrorMessage } from '@/api/axios'
import { setProfile } from '@/store/authSlice'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROLE_LABELS } from '@/utils/constants'
import { initialsFrom } from '@/utils/format'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  location: '',
  bio: '',
  githubUrl: '',
  linkedinUrl: '',
  profileImageUrl: '',
}

export default function Profile() {
  useDocumentTitle('Profile')

  const dispatch = useDispatch()
  const toast = useToast()
  const { userId, email, role, isEmployer } = useAuth()

  const [form, setForm] = useState(EMPTY_FORM)
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState(false)

  async function load() {
    setLoading(true)
    setLoadError(null)

    try {
      const profile = await userApi.getProfile(userId)
      setForm({ ...EMPTY_FORM, ...Object.fromEntries(
        Object.entries(profile).filter(([key]) => key in EMPTY_FORM),
      ) })
      setExists(true)
      dispatch(setProfile(profile))
    } catch (error) {
      // A 404 means the profile has simply not been created yet.
      if (error?.response?.status === 404) {
        setExists(false)
        setForm(EMPTY_FORM)
      } else {
        setLoadError(getErrorMessage(error, 'Could not load your profile.'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const nameInvalid = touched && (!form.firstName.trim() || !form.lastName.trim())

  async function onSubmit(event) {
    event.preventDefault()
    setTouched(true)

    if (!form.firstName.trim() || !form.lastName.trim()) return

    setSaving(true)

    try {
      // The create endpoint needs the email as a query parameter; update does not.
      const saved = exists
        ? await userApi.updateProfile(userId, form)
        : await userApi.createProfile(userId, email, form)

      dispatch(setProfile(saved))
      setExists(true)
      toast.success('Profile saved', 'Your details are up to date.')
    } catch (error) {
      toast.error('Could not save profile', getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  function field(name) {
    return {
      id: name,
      value: form[name],
      onChange: (event) => setForm({ ...form, [name]: event.target.value }),
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState message={loadError} onRetry={load} />
      </div>
    )
  }

  const displayName = [form.firstName, form.lastName].filter(Boolean).join(' ')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description={
          isEmployer
            ? 'How your company appears to candidates you contact.'
            : 'The details employers see alongside your applications.'
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-5 pt-5 sm:flex-row sm:items-center sm:pt-6">
          <Avatar
            size="xl"
            src={form.profileImageUrl}
            name={displayName}
            initials={initialsFrom(form.firstName, form.lastName) || email?.[0]?.toUpperCase()}
          />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">
              {displayName || 'Your name'}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {email}
              </span>
              {form.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {form.location}
                </span>
              )}
            </p>
            <Badge variant="primary" className="mt-3">
              {ROLE_LABELS[role] || role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!exists && (
        <div className="rounded-xl border border-amber-100 bg-warning-soft p-4">
          <p className="text-sm text-foreground">
            You have not set up a profile yet. Fill this in so employers know who they are
            reading about.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{isEmployer ? 'Company contact' : 'Personal details'}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="mb-1.5" required>
                  First name
                </Label>
                <Input {...field('firstName')} invalid={nameInvalid && !form.firstName.trim()} />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-1.5" required>
                  Last name
                </Label>
                <Input {...field('lastName')} invalid={nameInvalid && !form.lastName.trim()} />
              </div>
            </div>

            {nameInvalid && (
              <p className="text-sm text-destructive">
                First and last name are both required.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone" className="mb-1.5">
                  Phone
                </Label>
                <Input {...field('phone')} type="tel" placeholder="+1 555 0100" />
              </div>
              <div>
                <Label htmlFor="location" className="mb-1.5">
                  Location
                </Label>
                <Input {...field('location')} placeholder="City, country" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="mb-1.5">
                {isEmployer ? 'About the company' : 'Short bio'}
              </Label>
              <Textarea
                {...field('bio')}
                maxLength={2000}
                placeholder={
                  isEmployer
                    ? 'What the company does and what it is hiring for.'
                    : 'A few lines on what you do and what you are looking for.'
                }
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {form.bio.length} / 2000 characters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedinUrl" className="mb-1.5">
                <span className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  LinkedIn
                </span>
              </Label>
              <Input
                {...field('linkedinUrl')}
                type="url"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <Label htmlFor="githubUrl" className="mb-1.5">
                <span className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  GitHub
                </span>
              </Label>
              <Input
                {...field('githubUrl')}
                type="url"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <Label htmlFor="profileImageUrl" className="mb-1.5">
                Profile image URL
              </Label>
              <Input
                {...field('profileImageUrl')}
                type="url"
                placeholder="https://example.com/photo.jpg"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Paste a link to an image. SmartJob does not host profile photos.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={saving}>
            {exists ? 'Save changes' : 'Create profile'}
          </Button>
          <Button type="button" variant="outline" onClick={load} disabled={saving}>
            Discard changes
          </Button>
        </div>
      </form>

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-4">
        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your phone number and email are shared with an employer only when you apply to one of
          their roles.
        </p>
      </div>
    </div>
  )
}
