import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FullScreenLoader from '../components/FullScreenLoader';
import Message from '../components/Message';
import PostItem from '../components/posts/post.component';
import useStore from '../store';
import { trpc } from '../trpc';

const HomePage = () => {
  const store = useStore();
  const navigate = useNavigate();
  const {
    data: posts,
    isLoading,
    isFetching,
  } = trpc.useQuery(['posts.getPosts', { limit: 10, page: 1 }], {
    select: (data) => data.data.posts,
    onSuccess: (data) => {
      store.setPageLoading(false);
    },
    onError(error: any) {
      store.setPageLoading(false);
      error.response.errors.forEach((err: any) => {
        toast(err.message, {
          type: 'error',
          position: 'top-right',
        });
      });
    },
  });

  console.log(store.authUser);

  const loading = isLoading || isFetching;

  if (loading) {
    return <FullScreenLoader />;
  }
  return (
    <>
      <section className='bg-ct-blue-600 min-h-screen py-12'>
        <div>
          {posts?.length === 0 ? (
            <Message>There are no posts at the moment</Message>
          ) : (
            <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 px-6'>
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
