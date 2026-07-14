import { StatusDot } from './StatusDot';

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function DeliveryLogRow({ delivery }) {
  const isPulsing = delivery.status === 'RETRYING' || delivery.status === 'QUEUED';

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-border px-5 py-3 last:border-b-0">
      <StatusDot status={delivery.status} pulse={isPulsing} />

      <div className="min-w-0">
        <div className="truncate font-mono text-xs text-ink">
          event {delivery.eventId?.slice(0, 8)}
        </div>
        {delivery.lastError && (
          <div className="truncate text-[11px] text-dead">{delivery.lastError}</div>
        )}
      </div>

      <div className="font-mono text-[11px] text-muted">
        {delivery.lastResponseCode ? `HTTP ${delivery.lastResponseCode}` : '—'}
        {delivery.attemptCount > 0 && ` · attempt ${delivery.attemptCount}`}
      </div>

      <div className="font-mono text-[11px] text-muted">
        {timeAgo(delivery.deliveredAt || delivery.updatedAt || delivery.createdAt)}
      </div>
    </div>
  );
}
