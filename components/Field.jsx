export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-dead">{error}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-borderStrong bg-base px-3 py-2.5 text-sm text-ink placeholder:text-mutedDim outline-none transition-colors focus:border-signal"
    />
  );
}
