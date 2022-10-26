import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import postModel, { Post } from '../models/post.model';

export const createPost = async (input: Partial<Post>) => {
  return postModel.create(input);
};

export const getPost = async (
  query: FilterQuery<Post>,
  options?: QueryOptions
) => {
  return postModel.findOne(query, {}, options);
};

export const updatePost = async (
  query: FilterQuery<Post>,
  update: UpdateQuery<Post>,
  options: QueryOptions
) => {
  return postModel.findOneAndUpdate(query, update, options);
};

export const deletePost = async (
  query: FilterQuery<Post>,
  options: QueryOptions
) => {
  return postModel.findOneAndDelete(query, options);
};
