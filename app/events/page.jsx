'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/AppContext';
import { fetchEvents, fetchEventById } from '../../lib/eventsApi';
import { Panel } from '../../components/Panel';
import { StatusDot } from '../../components/StatusDot';

const TOPIC_OPTIONS = [
  'autopay.success',
  'autopay.failed',
  'autopay.mandate_created',
  'autopay.mandate_cancelled',
  'payment.success',
  'payment.failed',
  'payment.refunded',
];

export default function EventsPage() {
  const router = useRouter();
  const { state } = useAppStore();
  const [events, setEvents] = useState([]);
  const [topicFilter, setTopicFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = state.token || localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    fetchEvents(token, { topic: topicFilter || undefined })
      .then(setEvents)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFilter]);

  async function handleExpand(eventId) {
    if (expandedId === eventId) {
      setExpandedId(null);
      setExpandedDetail(null);
      return;
    }
    setExpandedId(eventId);
    const token = state.token || localStorage.getItem('token');
    const detail = await fetchEventById(eventId, token);
    setExpandedDetail(detail);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted">Console</div>
        <h1 className="mt-1 font-mono text-2xl text-ink">Events</h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip label="all" active={!topicFilter} onClick={() => setTopicFilter('')} />
        {TOPIC_OPTIONS.map((topic) => (
          <FilterChip
            key={topic}
            label={topic}
            active={topicFilter === topic}
            onClick={() => setTopicFilter(topic)}
          />
        ))}
      </div>

      <div className="mt-6">
        <Panel eyebrow="History" title="Recent ingested events">
          {loading && <p className="py-6 text-center font-mono text-xs text-muted">Loading…</p>}

          {!loading && events.length === 0 && (
            <p className="py-8 text-center font-mono text-xs text-muted">
              No events yet. POST to /api/v1/events to see them here.
            </p>
          )}

          <div className="-m-5">
            {events.map((event) => (
              <div key={event.id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => handleExpand(event.id)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-panelAlt"
                >
                  <div>
                    <div className="font-mono text-xs text-ink">{event.topic}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted">
                      {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted">
                    {event.id.slice(0, 8)} {expandedId === event.id ? '▲' : '▼'}
                  </span>
                </button>

                {expandedId === event.id && expandedDetail && (
                  <div className="border-t border-border bg-base px-5 py-4">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-muted">
                      Payload
                    </div>
                    <pre className="mt-2 overflow-x-auto rounded border border-border bg-panel p-3 font-mono text-[11px] text-ink">
{JSON.stringify(expandedDetail.payload, null, 2)}
                    </pre>

                    <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted">
                      Fan-out ({expandedDetail.deliveryAttempts?.length || 0} subscriber
                      {expandedDetail.deliveryAttempts?.length === 1 ? '' : 's'})
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {expandedDetail.deliveryAttempts?.map((d) => (
                        <div key={d.id} className="flex items-center gap-2 font-mono text-[11px] text-muted">
                          <StatusDot status={d.status} pulse={d.status === 'RETRYING'} />
                          <span>{d.subscriberId.slice(0, 8)}</span>
                          <span>· {d.status.toLowerCase()}</span>
                          {d.lastResponseCode && <span>· HTTP {d.lastResponseCode}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors ${
        active ? 'border-signal text-signal bg-signal-muted' : 'border-border text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
