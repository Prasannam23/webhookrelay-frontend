export function Panel({ children, className = '', title, eyebrow }) {
  return (
    <div className={`rounded-lg border border-border bg-panel ${className}`}>
      {(title || eyebrow) && (
        <div className="scanlines border-b border-border px-5 py-3">
          {eyebrow && (
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted">{eyebrow}</div>
          )}
          {title && <div className="mt-0.5 font-mono text-sm text-ink">{title}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
