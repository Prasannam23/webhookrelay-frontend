import { api } from './apiClient';

// Ingestion is the same endpoint a real source system (e.g. Paytm's
// autopay engine) would call — no auth required, only rate-limited.
// Used by the Test page so anyone can trigger a real event without a
// terminal.
export async function sendEvent({ topic, payload }) {
  return api.post('/events', { topic, payload });
}

export async function fetchEvents(token, { topic } = {}) {
  const query = topic ? `?topic=${encodeURIComponent(topic)}` : '';
  return api.get(`/events${query}`, token);
}

export async function fetchEventById(id, token) {
  return api.get(`/events/${id}`, token);
}
