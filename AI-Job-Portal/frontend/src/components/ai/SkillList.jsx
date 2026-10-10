import { Badge } from '@/components/ui/badge'

/**
 * `variant` carries the meaning: matched skills read as positive, missing
 * skills as a gap to close, everything else as neutral.
 */
export function SkillList({ title, skills = [], variant = 'default', emptyText = 'None listed' }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {skills.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill}>
              <Badge variant={variant}>{skill}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
