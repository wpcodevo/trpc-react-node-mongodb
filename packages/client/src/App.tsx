import { useState } from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useRoutes } from 'react-router-dom';
import { getFetch } from '@trpc/client';
import routes from './router';
import { trpc } from './trpc';
import AuthMiddleware from './middleware/AuthMiddleware';
import { CookiesProvider } from 'react-cookie';

function AppContent() {
  const content = useRoutes(routes);
  return content;
}

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: 'http://localhost:8000/api/trpc',
      fetch: async (input, init?) => {
        const fetch = getFetch();
        return fetch(input, {
          ...init,
          credentials: 'include',
        });
      },
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <CookiesProvider>
        <QueryClientProvider client={queryClient}>
          <AuthMiddleware>
            <AppContent />
          </AuthMiddleware>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </CookiesProvider>
    </trpc.Provider>
  );
}

export default App;
