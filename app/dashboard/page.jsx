'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/AppContext';
import { fetchSubscribers } from '../../lib/subscribersApi';
import { SubscriberCard } from '../../components/SubscriberCard';
import { CreateSubscriberModal } from '../../components/CreateSubscriberModal';
import { Button } from '../../components/Button';

export default function DashboardPage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!state.token && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    if (state.token) {
      fetchSubscribers(dispatch, state.token).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted">Console</div>
          <h1 className="mt-1 font-mono text-2xl text-ink">Subscribers</h1>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          + New subscriber
        </Button>
      </div>

      {state.loading && <p className="mt-8 font-mono text-xs text-muted">Loading…</p>}

      {!state.loading && state.subscribers.length === 0 && (
        <div className="mt-12 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-mono text-sm text-muted">No subscribers yet.</p>
          <p className="mt-1 text-xs text-muted">Register an endpoint to start receiving events.</p>
          <Button variant="ghost" className="mt-5" onClick={() => setShowCreate(true)}>
            + New subscriber
          </Button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.subscribers.map((sub) => (
          <SubscriberCard key={sub.id} subscriber={sub} />
        ))}
      </div>

      {showCreate && <CreateSubscriberModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
