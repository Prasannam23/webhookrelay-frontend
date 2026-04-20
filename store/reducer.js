import { ACTIONS } from './actions';

export const initialState = {
  user: null, 
  token: null,
  subscribers: [],
  deliveries: [], 
  loading: false,
  error: null,
};


export function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload.user, token: action.payload.token };

    case ACTIONS.LOGOUT:
      return { ...initialState };

    case ACTIONS.SET_SUBSCRIBERS:
      return { ...state, subscribers: action.payload };

    case ACTIONS.ADD_SUBSCRIBER:
      return { ...state, subscribers: [action.payload, ...state.subscribers] };

    case ACTIONS.REMOVE_SUBSCRIBER:
      return {
        ...state,
        subscribers: state.subscribers.filter((s) => s.id !== action.payload.id),
      };

    case ACTIONS.UPDATE_SUBSCRIBER: {
      const exists = state.subscribers.some((s) => s.id === action.payload.id);
      const subscribers = exists
        ? state.subscribers.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload } : s))
        : [action.payload, ...state.subscribers];
      return { ...state, subscribers };
    }

    case ACTIONS.SET_DELIVERIES:
      return { ...state, deliveries: action.payload };

    case ACTIONS.UPSERT_DELIVERY: {
      const incoming = action.payload;
      const exists = state.deliveries.some((d) => d.id === incoming.id);
      const deliveries = exists
        ? state.deliveries.map((d) => (d.id === incoming.id ? { ...d, ...incoming } : d))
        : [incoming, ...state.deliveries];
      return { ...state, deliveries };
    }

    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
