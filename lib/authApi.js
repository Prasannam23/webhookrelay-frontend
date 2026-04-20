import { api } from './apiClient';
import { ACTIONS } from '../store/actions';

// Each function here does two things: (1) call the backend, (2) dispatch
// the result as an action into the reducer. Components never call `api`
// directly for these flows — they call these functions with `dispatch`.
export async function registerUser({ email, password }, dispatch) {
  dispatch({ type: ACTIONS.SET_LOADING, payload: true });
  try {
    const data = await api.post('/auth/register', { email, password });
    persistAuth(data);
    dispatch({ type: ACTIONS.SET_USER, payload: data });
    return data;
  } catch (err) {
    dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
    throw err;
  } finally {
    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
  }
}

export async function loginUser({ email, password }, dispatch) {
  dispatch({ type: ACTIONS.SET_LOADING, payload: true });
  try {
    const data = await api.post('/auth/login', { email, password });
    persistAuth(data);
    dispatch({ type: ACTIONS.SET_USER, payload: data });
    return data;
  } catch (err) {
    dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
    throw err;
  } finally {
    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
  }
}

// Validates a stored token against the backend (GET /auth/me) instead of
// blindly trusting localStorage — if the token expired or was revoked,
// this logs the user out cleanly rather than showing a fake "logged in"
// state that fails on the first real request.
export async function fetchCurrentUser(token, dispatch) {
  try {
    const data = await api.get('/auth/me', token);
    dispatch({ type: ACTIONS.SET_USER, payload: { user: data.user, token } });
    return data.user;
  } catch (err) {
    logoutUser(dispatch);
    throw err;
  }
}

export function logoutUser(dispatch) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  dispatch({ type: ACTIONS.LOGOUT });
}

function persistAuth({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
