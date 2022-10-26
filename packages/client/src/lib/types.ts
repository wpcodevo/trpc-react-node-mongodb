export interface IUser {
  name: string;
  email: string;
  role: string;
  photo: string;
  _id: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type IPost = {
  _id: string;
  id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    name: string;
    photo: string;
  };
};
