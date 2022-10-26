import { useCookies } from "react-cookie";
import FullScreenLoader from "../components/FullScreenLoader";
import React from "react";
import { trpc } from "../trpc";
import { IUser } from "../libs/types";
import { useQueryClient } from "@tanstack/react-query";
import useStore from "../store";

type AuthMiddlewareProps = {
  children: React.ReactElement;
};

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [cookies] = useCookies(["logged_in"]);
  const store = useStore();

  const queryClient = useQueryClient();
  const { refetch } = trpc.refreshToken.useQuery(undefined, {
    retry: 1,
    enabled: false,
    onSuccess: (data) => {
      queryClient.invalidateQueries([["getMe"]]);
    },
    onError: (error) => {
      document.location.href = "/login";
    },
  });

  const query = trpc.getMe.useQuery(undefined, {
    retry: 1,
    enabled: !!cookies.logged_in,
    select: (data) => data.data.user,
    onSuccess: (data) => {
      store.setAuthUser(data as IUser);
    },
    onError: (error) => {
      let retryRequest = true;
      if (error.message.includes("must be logged in") && retryRequest) {
        retryRequest = false;
        try {
          refetch({ throwOnError: true });
        } catch (err: any) {
          console.log(err);
          if (err.message.includes("Could not refresh access token")) {
            document.location.href = "/login";
          }
        }
      }
    },
  });

  if (query.isLoading && cookies.logged_in) {
    console.log("Is loading...");
    return <FullScreenLoader />;
  }

  return children;
};

export default AuthMiddleware;
