import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, ListChecks, Scale, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreRing } from '@/components/ai/ScoreRing'
import { ScoreBar } from '@/components/ai/ScoreBar'
import { Badge } from '@/components/ui/badge'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const STEPS = [
  {
    title: 'You apply with a resume',
    body: 'Pick which uploaded resume to send. The file is parsed into plain text once, on upload.',
  },
  {
    title: 'The role and resume are compared',
    body: 'Your resume text is read against that job description specifically, not against a generic template.',
  },
  {
    title: 'A breakdown comes back',
    body: 'An overall match score, three sub-scores, the skills found, and written reasoning for the result.',
  },
  {
    title: 'Both sides see the same thing',
    body: 'You see it on your application; the recruiter sees it next to your name. Nothing is hidden from you.',
  },
]

const COMPONENTS = [
  {
    icon: Wrench,
    title: 'Skills',
    body: 'Which technologies and competencies the role asks for, and which of those your resume actually evidences.',
  },
  {
    icon: Scale,
    title: 'Experience',
    body: 'Whether the depth and shape of your background lines up with what the role requires.',
  },
  {
    icon: GraduationCap,
    title: 'Education',
    body: 'How your qualifications compare to the ones named in the job description.',
  },
  {
    icon: ListChecks,
    title: 'Reasoning',
    body: 'A written explanation of the score, so a number never stands on its own.',
  },
]

export default function AiCareer() {
  useDocumentTitle('AI Career')

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-muted/60 to-white">
        <div className="container py-16 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="primary">How scoring works</Badge>
              <h1 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[-0.03em] sm:text-5xl">
                A resume score you can actually act on
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                SmartJob reads your resume against the specific job you applied to and returns a
                breakdown: what matched, what is missing, and why the number came out where it
                did.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg">
                    Analyze my resume
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button size="lg" variant="outline">
                    Browse open roles
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="mx-auto w-full max-w-sm">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <ScoreRing value={87} size={150} label="Example match score" />
                </div>
                <div className="mt-6 space-y-4">
                  <ScoreBar label="Skills" value={95} />
                  <ScoreBar label="Experience" value={90} />
                  <ScoreBar label="Education" value={85} />
                </div>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  <Badge variant="success">Java</Badge>
                  <Badge variant="success">Spring Boot</Badge>
                  <Badge variant="success">React</Badge>
                  <Badge variant="warning">Kubernetes</Badge>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  An illustration of the breakdown, not a real candidate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">What happens when you apply</h2>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-border bg-white p-5 shadow-card"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="container py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">What goes into the score</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {COMPONENTS.map((component) => (
              <div
                key={component.title}
                className="flex gap-4 rounded-xl border border-border bg-white p-5 shadow-card"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                  <component.icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{component.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {component.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 text-center shadow-card">
          <h2 className="text-xl font-semibold">Where the line is</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A match score is one input a recruiter weighs alongside your resume, your experience
            and your interview. It does not shortlist, reject or hire anyone on its own, and every
            status change on SmartJob is made by a person.
          </p>
          <Link to="/register" className="mt-6 inline-block">
            <Button>Get my resume scored</Button>
          </Link>
        </div>
      </section>
    </>
  )
}
