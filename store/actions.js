// Central action-type registry for the app's useReducer store.
// Keeping these as constants (not raw strings scattered through the app)
// means a typo in an action type throws/no-ops obviously during dev
// instead of silently failing to match a case in the reducer.
export const ACTIONS = Object.freeze({
  // auth
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',

  // subscribers
  SET_SUBSCRIBERS: 'SET_SUBSCRIBERS',
  ADD_SUBSCRIBER: 'ADD_SUBSCRIBER',
  REMOVE_SUBSCRIBER: 'REMOVE_SUBSCRIBER',
  UPDATE_SUBSCRIBER: 'UPDATE_SUBSCRIBER',

  // deliveries (per-subscriber live feed)
  SET_DELIVERIES: 'SET_DELIVERIES',
  UPSERT_DELIVERY: 'UPSERT_DELIVERY', // live socket update — update if exists, prepend if new

  // ui
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
});
