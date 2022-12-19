import { AuthenticationError, ApolloError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new AuthenticationError('You are not authenticated as a user.');

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { isAdmin } }) => isAdmin ? skip : new AuthenticationError('You are not authenticated as a admin.')
);