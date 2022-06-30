import { useCookies } from 'react-cookie';
import { useStateContext } from '../context';
import FullScreenLoader from '../components/FullScreenLoader';
import React from 'react';
import { trpc } from '../trpc';
import { IUser } from '../context/types';
import { useQueryClient } from 'react-query';

type AuthMiddlewareProps = {
  children: React.ReactElement;
};

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [cookies] = useCookies(['logged_in']);
  const stateContext = useStateContext();

  const queryClient = useQueryClient();
  const { refetch } = trpc.useQuery(['auth.refresh'], {
    retry: 1,
    enabled: false,
    onSuccess: (data) => {
      queryClient.invalidateQueries('users.me');
    },
  });

  const query = trpc.useQuery(['users.me'], {
    enabled: !!cookies.logged_in,
    retry: 1,
    select: (data) => data.data.user,
    onSuccess: (data) => {
      stateContext.dispatch({ type: 'SET_USER', payload: data as IUser });
    },
    onError: (error) => {
      let retryRequest = true;
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

  if (query.isLoading) {
    return <FullScreenLoader />;
  }

  return children;
};

export default AuthMiddleware;
