'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../../store/AppContext';
import { useSubscriberSocket } from '../../../hooks/useSubscriberSocket';
import {
  deleteSubscriber,
  regenerateSecret,
  fetchSubscriberById,
  toggleSubscriberActive,
} from '../../../lib/subscribersApi';
import { Panel } from '../../../components/Panel';
import { Button } from '../../../components/Button';
import { StatusDot } from '../../../components/StatusDot';
import { DeliveryLogRow } from '../../../components/DeliveryLogRow';

export default function SubscriberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const [revealedSecret, setRevealedSecret] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Live delivery updates stream directly into state.deliveries via the reducer.
  useSubscriberSocket(id, dispatch);

  const subscriber = state.subscribers.find((s) => s.id === id);

  useEffect(() => {
    const token = state.token || localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Always fetch fresh — don't rely on the dashboard list already being
    // loaded, since this page can be reached via direct link or refresh.
    fetchSubscriberById(id, dispatch, token).catch((err) => setLoadError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleRegenerate() {
    setBusy(true);
    try {
      const { secret } = await regenerateSecret(id, state.token);
      setRevealedSecret(secret);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive() {
    setBusy(true);
    try {
      await toggleSubscriberActive(id, !subscriber.isActive, dispatch, state.token);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this subscriber? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteSubscriber(id, dispatch, state.token);
      router.push('/dashboard');
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="font-mono text-sm text-dead">{loadError}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/dashboard')}>
          ← Back to subscribers
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <button
        onClick={() => router.push('/dashboard')}
        className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink"
      >
        ← Subscribers
      </button>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl text-ink">{subscriber?.name || 'Loading…'}</h1>
            {subscriber && (
              <StatusDot
                status={subscriber.isActive ? 'ACTIVE' : 'INACTIVE'}
                pulse={subscriber.isActive}
                showLabel
              />
            )}
          </div>
          <p className="mt-1 font-mono text-xs text-muted">{subscriber?.targetUrl}</p>
        </div>

        {subscriber && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleToggleActive} disabled={busy}>
              {subscriber.isActive ? 'Pause' : 'Activate'}
            </Button>
            <Button variant="ghost" onClick={handleRegenerate} disabled={busy}>
              Regenerate secret
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {revealedSecret && (
        <div className="mt-4 rounded-md border-2 border-signal bg-signal-muted px-4 py-3">
          <p className="text-xs text-muted">New secret — copy it now, it won&apos;t be shown again:</p>
          <p className="mt-1 break-all font-mono text-xs text-signal">{revealedSecret}</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-1.5">
        {subscriber?.topics?.map((topic) => (
          <span
            key={topic}
            className="rounded border border-border bg-panel px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted"
          >
            {topic}
          </span>
        ))}
      </div>

      <div className="mt-8">
        <Panel eyebrow="Live" title="Delivery log">
          {state.deliveries.length === 0 ? (
            <p className="py-8 text-center font-mono text-xs text-muted">
              No deliveries yet. Send an event to this topic and watch it appear here.
            </p>
          ) : (
            <div className="-m-5">
              {state.deliveries.map((d) => (
                <DeliveryLogRow key={d.id} delivery={d} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
