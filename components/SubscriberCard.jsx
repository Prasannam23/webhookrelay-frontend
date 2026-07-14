'use client';

import Link from 'next/link';
import { StatusDot } from './StatusDot';

export function SubscriberCard({ subscriber }) {
  return (
    <Link
      href={`/subscribers/${subscriber.id}`}
      className="group block rounded-lg border border-border bg-panel p-5 transition-colors hover:border-signal"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-sm text-ink group-hover:text-signal transition-colors">
            {subscriber.name}
          </div>
          <div className="mt-1 truncate text-xs text-muted">{subscriber.targetUrl}</div>
        </div>
        <StatusDot status={subscriber.isActive ? 'ACTIVE' : 'INACTIVE'} pulse={subscriber.isActive} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {subscriber.topics?.map((topic) => (
          <span
            key={topic}
            className="rounded border border-border bg-base px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted"
          >
            {topic}
          </span>
        ))}
      </div>
    </Link>
  );
}
