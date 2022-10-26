import { number, object, string, TypeOf } from 'zod';

export const createPostSchema = object({
  title: string({
    required_error: 'Title is required',
  }),
  category: string({
    required_error: 'Category is required',
  }),
  content: string({
    required_error: 'Content is required',
  }),
  image: string({
    required_error: 'Image is required',
  }),
});

export const params = object({
  postId: string(),
});

export const updatePostSchema = object({
  params,
  body: object({
    title: string(),
    category: string(),
    content: string(),
    image: string(),
  }).partial(),
});

export const filterQuery = object({
  limit: number().default(1),
  page: number().default(10),
});

export type CreatePostInput = TypeOf<typeof createPostSchema>;
export type ParamsInput = TypeOf<typeof params>;
export type UpdatePostInput = TypeOf<typeof updatePostSchema>['body'];
export type FilterQueryInput = TypeOf<typeof filterQuery>;
