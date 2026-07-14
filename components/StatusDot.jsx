const STATUS_STYLES = {
  DELIVERED: { dot: 'bg-ok', ring: 'bg-ok', label: 'delivered' },
  QUEUED: { dot: 'bg-muted', ring: 'bg-muted', label: 'queued' },
  RETRYING: { dot: 'bg-signal', ring: 'bg-signal', label: 'retrying' },
  DEAD: { dot: 'bg-dead', ring: 'bg-dead', label: 'dead' },
  ACTIVE: { dot: 'bg-ok', ring: 'bg-ok', label: 'active' },
  INACTIVE: { dot: 'bg-muted', ring: 'bg-muted', label: 'inactive' },
};

// `pulse` controls whether the animated ring plays — used for "live"
// states (RETRYING, ACTIVE) but not for terminal states (DELIVERED, DEAD).
export function StatusDot({ status = 'QUEUED', pulse = false, showLabel = false }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.QUEUED;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${style.ring} animate-pulse-ring`}
          />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${style.dot}`} />
      </span>
      {showLabel && (
        <span className="font-mono text-xs uppercase tracking-wide text-muted">{style.label}</span>
      )}
    </span>
  );
}
