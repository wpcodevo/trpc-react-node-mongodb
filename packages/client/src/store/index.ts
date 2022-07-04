import create from 'zustand';
import { IUser } from '../libs/types';

type Store = {
  authUser: IUser | null;
  uploadingImage: boolean;
  pageLoading: boolean;
  openModal: boolean;
  setAuthUser: (user: IUser) => void;
  setUploadingImage: (isUploading: boolean) => void;
  setPageLoading: (isLoading: boolean) => void;
  setOpenModal: (isOpen: boolean) => void;
};

const useStore = create<Store>((set) => ({
  authUser: null,
  uploadingImage: false,
  pageLoading: false,
  openModal: false,
  setAuthUser: (user) => set((state) => ({ ...state, authUser: user })),
  setUploadingImage: (isUploading) =>
    set((state) => ({ ...state, uploadingImage: isUploading })),
  setPageLoading: (isLoading) =>
    set((state) => ({ ...state, pageLoading: isLoading })),
  setOpenModal: (isOpen) => set((state) => ({ ...state, openModal: isOpen })),
}));

export default useStore;
