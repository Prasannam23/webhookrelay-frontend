'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ACTIONS } from '../store/actions';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

// Connects once per subscriber detail page, joins that subscriber's
// room (matches sockets/index.js on the backend), and dispatches every
// 'delivery:update' event straight into the reducer via UPSERT_DELIVERY.
// This is what makes the dashboard flip green/red without a page refresh.
export function useSubscriberSocket(subscriberId, dispatch) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!subscriberId) return undefined;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe:subscriber', subscriberId);
    });

    socket.on('delivery:update', (deliveryAttempt) => {
      dispatch({ type: ACTIONS.UPSERT_DELIVERY, payload: deliveryAttempt });
    });

    return () => {
      socket.disconnect();
    };
  }, [subscriberId, dispatch]);

  return socketRef;
}
