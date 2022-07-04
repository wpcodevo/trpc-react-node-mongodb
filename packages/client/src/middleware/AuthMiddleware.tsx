import { useCookies } from 'react-cookie';
import React, { useEffect } from 'react';
import { trpc } from '../trpc';
import { useQueryClient } from 'react-query';
import useStore from '../store';
import { IUser } from '../lib/types';

type AuthMiddlewareProps = {
  children: React.ReactElement;
};

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [cookies] = useCookies(['logged_in']);
  const store = useStore();

  const queryClient = useQueryClient();
  const { refetch, isLoading, isFetching } = trpc.useQuery(['auth.refresh'], {
    retry: 1,
    enabled: false,
    onSuccess: (data) => {
      store.setPageLoading(false);
      queryClient.invalidateQueries('users.me');
    },
  });

  const query = trpc.useQuery(['users.me'], {
    enabled: !!cookies.logged_in,
    retry: 1,
    select: (data) => data.data.user,
    onSuccess: (data) => {
      store.setAuthUser(data as IUser);
      store.setPageLoading(false);
    },
    onError: (error) => {
      let retryRequest = true;
      store.setPageLoading(false);
      if (error.message.includes('must be logged in') && retryRequest) {
        retryRequest = false;
        try {
          refetch({ throwOnError: true });
        } catch (err: any) {
          console.log(err);
          if (err.message.includes('Could not refresh access token')) {
            document.location.href = '/login';
          }
        }
      }
    },
  });

  const loading =
    isLoading || isFetching || query.isLoading || query.isFetching;

  useEffect(() => {
    if (loading) {
      store.setPageLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return children;
};

export default AuthMiddleware;
