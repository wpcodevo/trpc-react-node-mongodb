import { omit } from 'lodash';
import { FilterQuery, QueryOptions } from 'mongoose';
import userModel, { User } from '../models/user.model';
import { signJwt } from '../utils/jwt';
import redisClient from '../utils/connectRedis';
import { DocumentType } from '@typegoose/typegoose';
import customConfig from '../config/default';

// Exclude this fields from the response
export const excludedFields = ['password'];

// CreateUser service
export const createUser = async (input: Partial<User>) => {
  const user = await userModel.create(input);
  return omit(user.toJSON(), excludedFields);
};

// Find User by Id
export const findUserById = async (id: string) => {
  const user = await userModel.findById(id).lean();
  return omit(user, excludedFields);
};

// Find All users
export const findAllUsers = async () => {
  return await userModel.find();
};

// Find one user by any fields
export const findUser = async (
  query: FilterQuery<User>,
  options: QueryOptions = {}
) => {
  return await userModel.findOne(query, {}, options).select('+password');
};

// Sign Token
export const signToken = async (user: DocumentType<User>) => {
  const userId = user._id.toString();
  // Sign the access token
  const access_token = signJwt({ sub: userId }, 'accessTokenPrivateKey', {
    expiresIn: `${customConfig.accessTokenExpiresIn}m`,
  });

  // Sign the refresh token
  const refresh_token = signJwt({ sub: userId }, 'refreshTokenPrivateKey', {
    expiresIn: `${customConfig.refreshTokenExpiresIn}m`,
  });

  // Create a Session
  redisClient.set(userId, JSON.stringify(user), {
    EX: 60 * 60,
  });

  // Return access token
  return { access_token, refresh_token };
};
