import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
  onData?: (payload: any) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const useRealtimeSubscription = ({
  table,
  event = '*',
  schema = 'public',
  filter,
  onData,
  onError,
  enabled = true
}: UseRealtimeSubscriptionOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const cleanup = () => {
    if (channelRef.current) {
      console.log(`[Realtime] Cleaning up subscription for ${table}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const createSubscription = () => {
    if (!enabled) return;

    console.log(`[Realtime] Creating subscription for ${table} (${event})`);
    
    const channelName = `realtime:${schema}:${table}:${Date.now()}`;
    const channel = supabase.channel(channelName);

    (channel as any).on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        ...(filter && { filter })
      },
      (payload: any) => {
        console.log(`[Realtime] Received ${payload.eventType || payload.type} for ${table}:`, payload);
        reconnectAttemptsRef.current = 0; // Reset on successful event
        onData?.(payload);
      }
    );

    channel
      .subscribe((status, err) => {
        console.log(`[Realtime] Subscription status for ${table}:`, status);
        
        if (status === 'SUBSCRIBED') {
          reconnectAttemptsRef.current = 0;
        } else if (status === 'CHANNEL_ERROR' && err) {
          console.error(`[Realtime] Channel error for ${table}:`, err);
          onError?.(new Error(`Channel error: ${err.message}`));
          
          // Attempt reconnection with exponential backoff
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectAttemptsRef.current += 1;
            
            console.log(`[Realtime] Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              cleanup();
              createSubscription();
            }, delay);
          }
        } else if (status === 'TIMED_OUT') {
          console.warn(`[Realtime] Subscription timed out for ${table}`);
          onError?.(new Error('Realtime subscription timed out'));
        } else if (status === 'CLOSED') {
          console.log(`[Realtime] Subscription closed for ${table}`);
        }
      });

    channelRef.current = channel;
  };

  useEffect(() => {
    createSubscription();
    return cleanup;
  }, [table, event, schema, filter, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    cleanup,
    reconnect: () => {
      cleanup();
      createSubscription();
    }
  };
};

export default useRealtimeSubscription;