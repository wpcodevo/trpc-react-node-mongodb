import useStore from '../store';

const ProfilePage = () => {
  const store = useStore();

  const user = store.authUser;

  return (
    <section className='bg-ct-blue-600 min-h-screen pt-20'>
      <div className='max-w-4xl mx-auto bg-ct-dark-100 rounded-md h-[20rem] flex justify-center items-center'>
        <div>
          <p className='text-5xl font-semibold'>Profile Page</p>
          <div className='mt-8'>
            <p className='mb-4'>ID: {user?.id}</p>
            <p className='mb-4'>Name: {user?.name}</p>
            <p className='mb-4'>Email: {user?.email}</p>
            <p className='mb-4'>Role: {user?.role}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
