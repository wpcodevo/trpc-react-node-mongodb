import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Message from "../components/Message";
import PostItem from "../components/posts/post.component";
import useStore from "../store";
import { trpc } from "../trpc";

const HomePage = () => {
  const [cookies] = useCookies(["logged_in"]);
  const store = useStore();
  const navigate = useNavigate();
  const { data: posts } = trpc.getPosts.useQuery(
    { limit: 10, page: 1 },
    {
      select: (data) => data.data.posts,
      retry: 1,
      onSuccess: (data) => {
        store.setPageLoading(false);
      },
      onError(error: any) {
        store.setPageLoading(false);
        toast(error.message, {
          type: "error",
          position: "top-right",
        });
      },
    }
  );

  useEffect(() => {
    if (!cookies.logged_in) {
      navigate("/login");
    }
  }, [cookies.logged_in, navigate]);

  return (
    <>
      <section className="bg-ct-blue-600 min-h-screen py-12">
        <div>
          {posts?.length === 0 ? (
            <Message>There are no posts at the moment</Message>
          ) : (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 px-6">
              {posts?.map((post: any) => (
                <PostItem key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
