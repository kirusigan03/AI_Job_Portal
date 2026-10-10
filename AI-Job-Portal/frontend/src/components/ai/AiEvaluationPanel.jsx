import { Info, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScoreRing } from './ScoreRing'
import { ScoreBar } from './ScoreBar'
import { RecommendationBadge } from './RecommendationBadge'
import { SkillList } from './SkillList'
import { formatDateTime, parseSkills } from '@/utils/format'

/**
 * Renders a ResumeAnalysis record from ai-service. The skill fields arrive as
 * comma-separated strings, so they are parsed into lists here.
 */
export function AiEvaluationPanel({ analysis, title = 'AI resume match', compact = false }) {
  if (!analysis) return null

  const extracted = parseSkills(analysis.extractedSkills)
  const matched = parseSkills(analysis.matchedSkills)
  const missing = parseSkills(analysis.missingSkills)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          {title}
        </CardTitle>
        <RecommendationBadge recommendation={analysis.recommendation} />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
          <ScoreRing value={analysis.matchScore} size={compact ? 132 : 160} />

          <div className="w-full flex-1 space-y-5">
            <ScoreBar label="Skills" value={analysis.skillsScore} />
            <ScoreBar label="Experience" value={analysis.experienceScore} />
            <ScoreBar label="Education" value={analysis.educationScore} />
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
          <SkillList
            title="Matched skills"
            skills={matched}
            variant="success"
            emptyText="No overlap with the role's requirements."
          />
          <SkillList
            title="Missing skills"
            skills={missing}
            variant="warning"
            emptyText="Nothing obvious is missing."
          />
        </div>

        {extracted.length > 0 && (
          <>
            <Separator />
            <SkillList title="Skills found in the resume" skills={extracted} />
          </>
        )}

        {analysis.reasoning && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-foreground">How this score was reached</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {analysis.reasoning}
              </p>
            </div>
          </>
        )}

        <div className="flex items-start gap-2.5 rounded-lg bg-muted px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            This score supports a hiring decision, it does not make one. Review the resume
            alongside it.
            {analysis.createdAt && ` Scored ${formatDateTime(analysis.createdAt)}.`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
