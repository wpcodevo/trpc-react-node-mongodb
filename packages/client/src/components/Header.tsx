import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useStore from "../store";
import { trpc } from "../trpc";

const Header = () => {
  const store = useStore();
  const user = store.authUser;

  const queryClient = useQueryClient();
  const { mutate: logoutUser } = trpc.logoutUser.useMutation({
    onSuccess(data) {
      queryClient.clear();
      document.location.href = "/login";
    },
    onError(error) {
      queryClient.clear();
      document.location.href = "/login";
    },
  });

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <header className="bg-white h-20">
      <nav className="h-full flex justify-between container items-center">
        <div>
          <Link to="/" className="text-ct-dark-600 text-2xl font-semibold">
            CodevoWeb
          </Link>
        </div>
        <ul className="flex items-center gap-4">
          <li>
            <Link to="/" className="text-ct-dark-600">
              Home
            </Link>
          </li>
          {!user && (
            <>
              <li>
                <Link to="/register" className="text-ct-dark-600">
                  SignUp
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-ct-dark-600">
                  Login
                </Link>
              </li>
            </>
          )}
          {user && (
            <>
              <li>
                <Link to="/profile" className="text-ct-dark-600">
                  Profile
                </Link>
              </li>
              <li className="cursor-pointer">Create Post</li>
              <li className="cursor-pointer" onClick={handleLogout}>
                Logout
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
