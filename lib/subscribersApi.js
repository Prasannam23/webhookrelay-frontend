import { api } from './apiClient';
import { ACTIONS } from '../store/actions';

export async function fetchSubscribers(dispatch, token) {
  dispatch({ type: ACTIONS.SET_LOADING, payload: true });
  try {
    const data = await api.get('/subscribers', token);
    dispatch({ type: ACTIONS.SET_SUBSCRIBERS, payload: data });
    return data;
  } catch (err) {
    dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
    throw err;
  } finally {
    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
  }
}

// Returns the raw secret to the caller (shown once in the UI) while
// also dispatching the new subscriber into the list.
export async function fetchSubscriberById(id, dispatch, token) {
  const data = await api.get(`/subscribers/${id}`, token);
  dispatch({ type: ACTIONS.UPDATE_SUBSCRIBER, payload: data });
  return data;
}

export async function createSubscriber(payload, dispatch, token) {
  const data = await api.post('/subscribers', payload, token);
  dispatch({ type: ACTIONS.ADD_SUBSCRIBER, payload: data });
  return data; // includes rawSecret — component shows it once, then discards
}

export async function deleteSubscriber(id, dispatch, token) {
  await api.delete(`/subscribers/${id}`, token);
  dispatch({ type: ACTIONS.REMOVE_SUBSCRIBER, payload: { id } });
}

export async function toggleSubscriberActive(id, isActive, dispatch, token) {
  const data = await api.patch(`/subscribers/${id}`, { isActive }, token);
  dispatch({ type: ACTIONS.UPDATE_SUBSCRIBER, payload: data });
  return data;
}

export async function regenerateSecret(id, token) {
  // Deliberately not dispatched into the store — the secret is shown
  // once in the calling component's local state, never held globally.
  return api.post(`/subscribers/${id}/regenerate-secret`, {}, token);
}
