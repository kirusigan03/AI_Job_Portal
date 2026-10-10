export const ROLES = {
  JOB_SEEKER: 'JOB_SEEKER',
  EMPLOYER: 'EMPLOYER',
  ADMIN: 'ADMIN',
}

export const ROLE_LABELS = {
  JOB_SEEKER: 'Job seeker',
  EMPLOYER: 'Employer',
  ADMIN: 'Admin',
}

export const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']

export const JOB_STATUSES = ['ACTIVE', 'CLOSED', 'DRAFT']

export const APPLICATION_STATUSES = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
]

/** The order a healthy application moves through, used by the timeline. */
export const APPLICATION_PIPELINE = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
]

export const RECOMMENDATIONS = ['STRONG_MATCH', 'GOOD_MATCH', 'WEAK_MATCH']

export const EXPERIENCE_OPTIONS = [
  { value: '0-1', label: '0 - 1 years' },
  { value: '1-3', label: '1 - 3 years' },
  { value: '3-5', label: '3 - 5 years' },
  { value: '5+', label: '5+ years' },
]

export const MAX_RESUME_BYTES = 5 * 1024 * 1024

export const ACCEPTED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const HOME_FOR_ROLE = {
  JOB_SEEKER: '/dashboard',
  EMPLOYER: '/employer',
  ADMIN: '/admin',
}
