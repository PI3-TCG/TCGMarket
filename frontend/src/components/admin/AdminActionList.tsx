import {
  describeAction,
  participantName,
} from '@/components/admin/adminUserFormat'
import type { AdminAction } from '@/types/AdminUser'

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

type AdminActionListProps = {
  actions: AdminAction[]
  showTarget?: boolean
  label: string
}

export function AdminActionList({
  actions,
  showTarget = false,
  label,
}: AdminActionListProps) {
  return (
    <ol aria-label={label} className="divide-y divide-neutral-200">
      {actions.map((action) => (
        <li key={action.id} className="space-y-1 py-3 text-sm">
          <p className="font-semibold text-neutral-900">
            {describeAction(action)}
            {showTarget ? (
              <span className="font-normal text-neutral-700">
                {' '}
                · {participantName(action.target)}
              </span>
            ) : null}
          </p>
          {action.reason ? (
            <p className="text-neutral-700">Motivo: {action.reason}</p>
          ) : null}
          <p className="text-xs text-neutral-500">
            Por {participantName(action.actor)} em{' '}
            <time dateTime={action.createdAt}>
              {dateTimeFormat.format(new Date(action.createdAt))}
            </time>
          </p>
        </li>
      ))}
    </ol>
  )
}
