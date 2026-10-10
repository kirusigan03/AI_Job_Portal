import { CheckCircle2, CircleAlert, ThumbsUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const CONFIG = {
  STRONG_MATCH: { label: 'Strong match', variant: 'success', icon: CheckCircle2 },
  GOOD_MATCH: { label: 'Good match', variant: 'primary', icon: ThumbsUp },
  WEAK_MATCH: { label: 'Weak match', variant: 'warning', icon: CircleAlert },
}

export function RecommendationBadge({ recommendation, size }) {
  if (!recommendation) return null

  const config = CONFIG[recommendation] || {
    label: recommendation,
    variant: 'default',
    icon: CircleAlert,
  }
  const Icon = config.icon

  return (
    <Badge variant={config.variant} size={size}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
