import { useDemoMode } from '@/contexts/DemoModeContext';
import { supabase } from '@/integrations/supabase/client';
import { getMockData } from '@/lib/mockDashboardData';

/**
 * Demo-aware Supabase client wrapper
 * Intercepts all database calls in demo mode to provide mock data
 * and prevent mutations from affecting real database
 */
export function useDemoSupabase() {
  const { isDemoMode, showDemoToast } = useDemoMode();

  if (!isDemoMode) {
    return supabase;
  }

  // Create a proxy that intercepts Supabase calls
  return new Proxy(supabase, {
    get(target, prop) {
      // Intercept the 'from' method to return mock data
      if (prop === 'from') {
        return (table: string) => {
          const mockData = getMockData(table);
          
          return {
            // SELECT queries return mock data
            select: (columns?: string) => ({
              eq: (column: string, value: any) => ({
                single: async () => ({ data: mockData[0] || null, error: null }),
                limit: (count: number) => ({
                  data: mockData.slice(0, count),
                  error: null,
                }),
                order: (column: string, options?: any) => ({
                  data: mockData,
                  error: null,
                }),
                data: mockData,
                error: null,
              }),
              order: (column: string, options?: any) => ({
                data: mockData,
                error: null,
              }),
              limit: (count: number) => ({
                data: mockData.slice(0, count),
                error: null,
              }),
              single: async () => ({ data: mockData[0] || null, error: null }),
              then: (resolve: any) => resolve({ data: mockData, error: null }),
            }),
            
            // INSERT blocked in demo mode
            insert: (data: any) => {
              showDemoToast('Demo mode - changes won\'t be saved');
              return {
                select: () => ({
                  single: async () => ({ 
                    data: Array.isArray(data) ? data[0] : data, 
                    error: null 
                  }),
                  then: (resolve: any) => resolve({ 
                    data: Array.isArray(data) ? data : [data], 
                    error: null 
                  }),
                }),
                then: (resolve: any) => resolve({ 
                  data: Array.isArray(data) ? data : [data], 
                  error: null 
                }),
              };
            },
            
            // UPDATE blocked in demo mode
            update: (data: any) => {
              showDemoToast('Demo mode - changes won\'t be saved');
              return {
                eq: (column: string, value: any) => ({
                  select: () => ({
                    single: async () => ({ data: { ...data, id: value }, error: null }),
                  }),
                  then: (resolve: any) => resolve({ data: { ...data }, error: null }),
                }),
              };
            },
            
            // DELETE blocked in demo mode
            delete: () => {
              showDemoToast('Demo mode - changes won\'t be saved');
              return {
                eq: (column: string, value: any) => ({
                  then: (resolve: any) => resolve({ data: null, error: null }),
                }),
              };
            },
          };
        };
      }
      
      // Intercept RPC calls
      if (prop === 'rpc') {
        return (funcName: string, params?: any) => {
          showDemoToast('Demo mode - function calls are simulated');
          // Return appropriate mock data based on function name
          if (funcName === 'has_role') {
            return Promise.resolve({ data: true, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        };
      }
      
      // Intercept auth
      if (prop === 'auth') {
        return {
          getUser: async () => ({
            data: {
              user: {
                id: 'demo-user-id',
                email: 'demo@example.com',
                user_metadata: { display_name: 'Demo User' },
              },
            },
            error: null,
          }),
          getSession: async () => ({
            data: {
              session: {
                user: {
                  id: 'demo-user-id',
                  email: 'demo@example.com',
                },
              },
            },
            error: null,
          }),
          signOut: async () => {
            showDemoToast('Demo mode - sign out disabled');
            return { error: null };
          },
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } },
          }),
        };
      }
      
      // Pass through all other properties
      return target[prop as keyof typeof target];
    },
  }) as typeof supabase;
}
