import { TRPCError } from '@trpc/server';
import { Context } from '../app';
import postModel from '../models/post.model';
import {
  CreatePostInput,
  FilterQueryInput,
  ParamsInput,
  UpdatePostInput,
} from '../schema/post.schema';
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from '../services/post.service';
import { findUserById } from '../services/user.service';

export const createPostHandler = async ({
  input,
  ctx,
}: {
  input: CreatePostInput;
  ctx: Context;
}) => {
  try {
    const userId = ctx.user!.id;
    const user = await findUserById(userId);

    const post = await createPost({
      title: input.title,
      content: input.content,
      category: input.category,
      image: input.image,
      user: user._id,
    });

    return {
      status: 'success',
      data: {
        post,
      },
    };
  } catch (err: any) {
    if (err.code === '11000') {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Post with that title already exists',
      });
    }
    throw err;
  }
};

export const getPostHandler = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  try {
    const post = await getPost({ _id: paramsInput.postId }, { lean: true });

    if (!post) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post with that ID not found',
      });
    }

    return {
      status: 'success',
      data: {
        post,
      },
    };
  } catch (err: any) {
    throw err;
  }
};

export const getPostsHandler = async ({
  filterQuery,
}: {
  filterQuery: FilterQueryInput;
}) => {
  try {
    const limit = filterQuery.limit || 10;
    const page = filterQuery.page || 1;
    const skip = (page - 1) * limit;
    const posts = await postModel
      .find()
      .skip(skip)
      .limit(limit)
      .populate({ path: 'user', select: 'name email photo' });

    return {
      status: 'success',
      results: posts.length,
      data: {
        posts,
      },
    };
  } catch (err: any) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
    });
  }
};

export const updatePostHandler = async ({
  paramsInput,
  input,
}: {
  paramsInput: ParamsInput;
  input: UpdatePostInput;
}) => {
  try {
    const post = await updatePost({ _id: paramsInput.postId }, input, {
      lean: true,
    });

    if (!post) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post with that ID not found',
      });
    }

    return {
      status: 'success',
      data: {
        post,
      },
    };
  } catch (err: any) {
    throw err;
  }
};

export const deletePostHandler = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  try {
    const post = await deletePost({ _id: paramsInput.postId }, { lean: true });

    if (!post) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post with that ID not found',
      });
    }

    return {
      status: 'success',
      data: null,
    };
  } catch (err: any) {
    throw err;
  }
};
