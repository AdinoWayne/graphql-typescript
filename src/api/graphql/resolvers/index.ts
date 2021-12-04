import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '../../../interfaces/IUser';
import { ILikeInputDTO, IPost, IPostInputDTO, likeType } from '../../../interfaces/IPost';
import { IProfile } from '../../../interfaces/IProfiles';
import { validate, ValidationError } from 'validator-fluent';
import { Request } from 'express';

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
	posts: async () => {
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const posts = await PostModel.find({});
		return posts;
	},
	post: async (_id: string) => {
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = PostModel.findOne({ _id: _id });
		return post;
	},
	profiles: async () => {
		const ProfileModel = Container.get('profileModel') as mongoose.Model<IProfile & mongoose.Document>;
		const profiles = await ProfileModel.find({});
		return profiles;
	},
	profile: async (_id: string) => {
		const ProfileModel = Container.get('profileModel') as mongoose.Model<IProfile & mongoose.Document>;
		const profile = ProfileModel.findOne({ _id: _id });
		return profile;
	},
	storePost: async ({ input }: { input: IPostInputDTO }, args: Request) => {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 8, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = new PostModel({
			text: data.text,
			name: args.currentUser.name,
			avatar: args.currentUser.avatar,
			user: args.currentUser._id,
		});
		return post;
	},
	updatePost: async ({ postId, input }: { postId: string; input: IPostInputDTO }, args: Request) => {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 8, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId });
		// Check post
		if (!post) {
			throw new Error('Post Not Found');
		}
		// Check user
		if (post.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		post.text = data.text;
		await post.save();
		return post;
	},
	destroyPost: async ({ postId }: { postId: string }, args: Request) => {
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId });
		// Check post
		if (!post) {
			throw new Error('Post Not Found');
		}
		// Check user
		if (post.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		const postObject = post.toObject();
		await post.remove();

		return postObject;
	},
	storePostLike: async ({ postId, input }: { postId: string; input: ILikeInputDTO }, args: Request) => {
		const [data, errors] = validate(input, value => ({
			type: value('type')
				.notEmpty()
				.toNumber()
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['type'][0]);
		}
		// Check type
		if (!likeType[data.type]) {
			throw new Error('Invalid type');
		}
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId });
		if (!post) {
			throw new Error('Post Not Found');
		}
		// Check if the post has already been liked
		if (
			post.likes.filter(like => like.user.toString() === args.currentUser._id.toString()).length > 0
		) {
			throw new Error('Post already liked');
		}
		post.likes.unshift({ user: args.currentUser._id, type: data.type });

		await post.save();

		return { _id: postId };
	},
	destroyPostLike: async ({ postId }: { postId: string }, args: Request) => {
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId });
		if (!post) {
			throw new Error('Post Not Found');
		}
		// Check if the post has already been liked
		if (
			post.likes.filter(like => like.user.toString() === args.currentUser._id.toString()).length === 0
		) {
			throw new Error('Post has not yet been liked');
		}

		// Get remove index
		const removeIndex = post.likes
			.map(like => like.user.toString())
			.indexOf(args.currentUser._id);

		post.likes.splice(removeIndex, 1);

		await post.save();

		return { _id: postId };
	},
	storeComment: async ({ postId, input}: { postId: string, input: IPostInputDTO}, args: Request) => {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 8, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId});
		const newComment = {
			text: data.text,
			name: args.currentUser.name,
			avatar: args.currentUser.avatar,
			user: args.currentUser._id
		};
		post.comments.unshift(newComment);
		await post.save();

		return { _id: postId};
	},
	updateComment: async({ postId, commentId, input}: { postId: string, commentId: string, input: IPostInputDTO}, args: Request) => {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 8, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId});
		// Pull out comment
		const comment = post.comments.find(
			comment => comment._id.toString() === commentId.toString()
		);
		// Make sure comment exists
		if (!comment) {
			throw new Error('Comment does not exist');
		}
		// Check user
		if (comment.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		// Get remove index
		const updateIndex = post.comments
			.map(comment => comment._id)
			.indexOf(commentId);
		post.comments[updateIndex].text = data.text;
		post.save();
		return { _id: postId};
	},
	destroyComment: async ({ postId, commentId}: { postId: string, commentId: string}, args: Request) => {
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId});
		// Pull out comment
		const comment = post.comments.find(
			comment => comment._id.toString() === commentId.toString()
		);
		// Make sure comment exists
		if (!comment) {
			throw new Error('Comment does not exist');
		}
		// Check user
		if (comment.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		// Get remove index
		const removeIndex = post.comments
			.map(comment => comment._id)
			.indexOf(commentId);

		post.comments.splice(removeIndex, 1);

		await post.save();

		return { _id: postId};
	}
};
