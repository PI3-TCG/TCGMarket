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

/** Estilo limitado aos históricos administrativos, com a mesma lógica anterior. */
export function AdminActionList({
  actions,
  showTarget = false,
  label,
}: AdminActionListProps) {
  return (
    <ol aria-label={label} className="divide-y divide-[#E4D3ED]">
      {actions.map((action) => (
        <li
          key={action.id}
          className="space-y-1.5 px-2 py-3.5 text-sm transition-colors hover:bg-[#F8F0FC]"
        >
          <p className="font-bold text-[#351846]">
            {describeAction(action)}
            {showTarget ? (
              <span className="font-normal text-[#665676]">
                {' '}
                · {participantName(action.target)}
              </span>
            ) : null}
          </p>
          {action.reason ? (
            <p className="break-words text-[#665676]">
              Motivo: {action.reason}
            </p>
          ) : null}
          <p className="text-xs text-[#776984]">
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
