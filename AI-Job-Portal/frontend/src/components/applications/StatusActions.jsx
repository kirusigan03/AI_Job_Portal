import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { CalendarCheck, Check, MoreHorizontal, ThumbsUp, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '@/components/ui/dropdown'
import { updateApplicationStatus } from '@/store/applicationSlice'
import { useToast } from '@/hooks/useToast'
import { humanize } from '@/utils/format'

const ACTIONS = [
  { status: 'UNDER_REVIEW', label: 'Move to review', icon: Eye },
  { status: 'SHORTLISTED', label: 'Shortlist', icon: ThumbsUp },
  { status: 'INTERVIEW', label: 'Move to interview', icon: CalendarCheck },
  { status: 'SELECTED', label: 'Select candidate', icon: Check },
]

/**
 * Status changes are an employer/admin action; the backend rejects them from
 * any other role, so this control is only rendered on employer screens.
 */
export function StatusActions({ application, onUpdated, variant = 'menu' }) {
  const dispatch = useDispatch()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  async function change(status) {
    if (status === application.status) return

    setBusy(true)
    const result = await dispatch(updateApplicationStatus({ id: application.id, status }))
    setBusy(false)

    if (updateApplicationStatus.fulfilled.match(result)) {
      toast.success('Status updated', `Now marked ${humanize(status).toLowerCase()}.`)
      onUpdated?.(result.payload)
    } else {
      toast.error('Could not update status', result.payload)
    }
  }

  if (variant === 'buttons') {
    return (
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Button
            key={action.status}
            size="sm"
            variant={action.status === 'SELECTED' ? 'default' : 'outline'}
            disabled={busy || application.status === action.status}
            onClick={() => change(action.status)}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive-soft"
          disabled={busy || application.status === 'REJECTED'}
          onClick={() => change('REJECTED')}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>
    )
  }

  return (
    <Dropdown
      trigger={
        <Button variant="ghost" size="icon-sm" disabled={busy} aria-label="Change status">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
    >
      <DropdownLabel>Move candidate to</DropdownLabel>
      {ACTIONS.map((action) => (
        <DropdownItem
          key={action.status}
          icon={action.icon}
          disabled={application.status === action.status}
          onClick={() => change(action.status)}
        >
          {action.label}
        </DropdownItem>
      ))}
      <DropdownSeparator />
      <DropdownItem
        icon={X}
        destructive
        disabled={application.status === 'REJECTED'}
        onClick={() => change('REJECTED')}
      >
        Reject
      </DropdownItem>
    </Dropdown>
  )
}
