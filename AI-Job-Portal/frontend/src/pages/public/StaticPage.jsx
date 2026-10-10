import { Link } from 'react-router-dom'
import { Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CONTENT = {
  about: {
    title: 'About SmartJob',
    intro:
      'SmartJob is a job portal built around one idea: a candidate and a recruiter should be looking at the same evidence.',
    sections: [
      {
        heading: 'What the platform does',
        body: 'Job seekers upload a resume once, apply to roles in two clicks, and track every application from a single dashboard. Employers publish roles and review applicants with a resume match score attached to each one.',
      },
      {
        heading: 'How it is built',
        body: 'SmartJob runs as a set of Spring Boot microservices behind an API gateway. Authentication, users, jobs, applications, resumes, notifications and resume scoring are each their own service, coordinated over Kafka so scoring and notifications happen without holding up the request you made.',
      },
      {
        heading: 'Our position on automated scoring',
        body: 'A match score narrows attention; it does not make decisions. Every shortlist, interview invitation and rejection on SmartJob is recorded against a person who made it.',
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    intro:
      'This page explains what SmartJob stores, who can see it, and how long it stays around.',
    sections: [
      {
        heading: 'What is stored',
        body: 'Your email address and role, the profile details you choose to fill in, the resumes you upload along with the text extracted from them, the applications you submit, and the match scores produced for those applications.',
      },
      {
        heading: 'Who can see your resume',
        body: 'You can always see your own resumes and scores. An employer can see a resume and its evaluation as part of reviewing a candidate who applied to one of their roles. Other job seekers cannot see either.',
      },
      {
        heading: 'Notifications',
        body: 'SmartJob sends notifications when an application is submitted, when its status changes, and when a resume evaluation finishes. These are delivered in the app and, where configured, by email to the address on your account.',
      },
      {
        heading: 'Deleting your data',
        body: 'You can delete any resume from the My resumes page, which removes the stored file and its extracted text. To remove an account entirely, contact the team.',
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'The ground rules for using SmartJob.',
    sections: [
      {
        heading: 'Accounts',
        body: 'You are responsible for what happens under your account and for keeping your password to yourself. Accounts are tied to a single role, which determines what you can do on the platform.',
      },
      {
        heading: 'Content you upload',
        body: 'Upload only resumes and job descriptions you have the right to share. You keep ownership of what you upload; SmartJob processes it to run the service.',
      },
      {
        heading: 'Fair use',
        body: 'Do not scrape the platform, post misleading job listings, or use SmartJob to contact candidates for anything other than the role they applied to.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'Questions about a role, an application or the platform itself.',
    sections: [
      {
        heading: 'Support',
        body: 'For account, application or resume questions, email support@smartjob.example and include the email address on your account.',
      },
      {
        heading: 'For employers',
        body: 'For questions about posting roles or reviewing candidates, email employers@smartjob.example.',
      },
      {
        heading: 'Response times',
        body: 'Support replies within two business days. Anything involving account access is prioritised.',
      },
    ],
  },
}

export default function StaticPage({ page }) {
  const content = CONTENT[page] || CONTENT.about
  useDocumentTitle(content.title)

  return (
    <div className="container max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">{content.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{content.intro}</p>

      <div className="mt-10 space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      {page === 'contact' && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:support@smartjob.example"
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-5 shadow-card transition-colors hover:border-slate-300"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft">
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-medium">Email support</span>
              <span className="block text-sm text-muted-foreground">
                support@smartjob.example
              </span>
            </span>
          </a>

          <a
            href="mailto:employers@smartjob.example"
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-5 shadow-card transition-colors hover:border-slate-300"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft">
              <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-medium">Employer team</span>
              <span className="block text-sm text-muted-foreground">
                employers@smartjob.example
              </span>
            </span>
          </a>
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8">
        <Link to="/jobs">
          <Button variant="outline">Browse open roles</Button>
        </Link>
      </div>
    </div>
  )
}
