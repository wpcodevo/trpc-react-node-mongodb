import { useCookies } from "react-cookie";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { IUser } from "../lib/types";
import useStore from "../store";
import { trpc } from "../trpc";
import FullScreenLoader from "./FullScreenLoader";

const RequireUser = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const [cookies] = useCookies(["logged_in"]);
  const location = useLocation();
  const store = useStore();

  const { isLoading, isFetching } = trpc.getMe.useQuery(undefined, {
    retry: 1,
    select: (data) => data.data.user,
    onSuccess: (data) => {
      store.setPageLoading(false);
      store.setAuthUser(data as IUser);
    },
    onError: (error) => {
      let retryRequest = true;
      store.setPageLoading(false);
      if (error.message.includes("must be logged in") && retryRequest) {
        retryRequest = false;
        try {
        } catch (err: any) {
          console.log(err);
          if (err.message.includes("Could not refresh access token")) {
            document.location.href = "/login";
          }
        }
      }
    },
  });

  const loading = isLoading || isFetching;
  const user = store.authUser;

  if (loading) {
    return <FullScreenLoader />;
  }

  return (cookies.logged_in || user) &&
    allowedRoles.includes(user?.role as string) ? (
    <Outlet />
  ) : cookies.logged_in && user ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireUser;
