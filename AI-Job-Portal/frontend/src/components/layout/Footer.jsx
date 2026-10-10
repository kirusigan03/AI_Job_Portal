import { Link } from 'react-router-dom'

const columns = [
  {
    heading: 'Product',
    links: [
      { to: '/jobs', label: 'Jobs' },
      { to: '/companies', label: 'Companies' },
      { to: '/ai-career', label: 'AI Career' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              SJ
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.02em]">SmartJob</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A hiring platform that scores every resume against the role it was sent to, so
            candidates and recruiters both know where they stand.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.heading}>
            <h2 className="text-sm font-semibold text-foreground">{column.heading}</h2>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SmartJob. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Resume scores are decision support, never an automatic hiring decision.
          </p>
        </div>
      </div>
    </footer>
  )
}
