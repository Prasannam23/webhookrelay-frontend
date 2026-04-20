'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { appReducer, initialState } from './reducer';
import { ACTIONS } from './actions';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // On first load, validate any stored token against the backend
  // (GET /auth/me) rather than trusting localStorage blindly — an
  // expired/revoked token gets logged out immediately instead of
  // silently failing on the first real request the user makes.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    import('../lib/authApi').then(({ fetchCurrentUser }) => {
      fetchCurrentUser(token, dispatch).catch(() => {
        // fetchCurrentUser already dispatches LOGOUT on failure
      });
    });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

// Consumed as: const { state, dispatch } = useAppStore();
export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used inside <AppProvider>');
  return ctx;
}
