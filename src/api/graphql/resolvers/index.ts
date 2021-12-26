import { Container } from 'typedi';
import mongoose from 'mongoose';
import { pubsub } from '../subscriptions';
import { IUser } from '../../../interfaces/IUser';
import { Request } from 'express';
import { withFilter } from 'graphql-subscriptions';
import { postResolvers } from './post';
import { profileResolvers } from './profile';

export const graphQlResolvers = {
	users: async () => {
		const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
		const users = await UserModel.find({});
		return users;
	},
	user: async (_id: string) => {
		const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
		const user = UserModel.findOne({ _id: _id });
		return user;
	},
	...postResolvers,
	...profileResolvers,
	commentAdded: async ({ postId }: { postId: string }, args: Request) => {
		console.log(postId, args);
		return await (withFilter(() => pubsub.asyncIterator('commentAdded'), (payload, variables, context) => {
			console.log(payload, variables, context);
			return payload.postId === variables.postId;
		}))(args, { postId});
	},
};
