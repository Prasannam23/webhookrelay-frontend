export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'font-mono text-xs uppercase tracking-wide px-4 py-2.5 rounded-md transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

  const variants = {
    primary: 'bg-signal text-base shadow-hard hover:shadow-hardSm',
    ghost: 'border border-borderStrong text-ink hover:border-signal hover:text-signal',
    danger: 'border border-dead text-dead hover:bg-deadMuted',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
