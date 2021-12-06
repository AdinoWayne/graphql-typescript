import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '../../../interfaces/IUser';
import { ILikeInputDTO, IPost, IPostInputDTO, likeType } from '../../../interfaces/IPost';
import { IProfile, IProfileInputDTO } from '../../../interfaces/IProfiles';
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
				.toNumber(),
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
		if (post.likes.filter(like => like.user.toString() === args.currentUser._id.toString()).length > 0) {
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
		if (post.likes.filter(like => like.user.toString() === args.currentUser._id.toString()).length === 0) {
			throw new Error('Post has not yet been liked');
		}

		// Get remove index
		const removeIndex = post.likes.map(like => like.user.toString()).indexOf(args.currentUser._id);

		post.likes.splice(removeIndex, 1);

		await post.save();

		return { _id: postId };
	},
	storeComment: async ({ postId, input }: { postId: string; input: IPostInputDTO }, args: Request) => {
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
		const newComment = {
			text: data.text,
			name: args.currentUser.name,
			avatar: args.currentUser.avatar,
			user: args.currentUser._id,
		};
		post.comments.unshift(newComment);
		await post.save();

		return { _id: postId };
	},
	updateComment: async (
		{ postId, commentId, input }: { postId: string; commentId: string; input: IPostInputDTO },
		args: Request,
	) => {
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
		// Pull out comment
		const comment = post.comments.find(comment => comment._id.toString() === commentId.toString());
		// Make sure comment exists
		if (!comment) {
			throw new Error('Comment does not exist');
		}
		// Check user
		if (comment.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		// Get remove index
		const updateIndex = post.comments.map(comment => comment._id).indexOf(commentId);
		post.comments[updateIndex].text = data.text;
		post.save();
		return { _id: postId };
	},
	destroyComment: async ({ postId, commentId }: { postId: string; commentId: string }, args: Request) => {
		const PostModel = Container.get('postModel') as mongoose.Model<IPost & mongoose.Document>;
		const post = await PostModel.findOne({ _id: postId });
		// Pull out comment
		const comment = post.comments.find(comment => comment._id.toString() === commentId.toString());
		// Make sure comment exists
		if (!comment) {
			throw new Error('Comment does not exist');
		}
		// Check user
		if (comment.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		// Get remove index
		const removeIndex = post.comments.map(comment => comment._id).indexOf(commentId);

		post.comments.splice(removeIndex, 1);

		await post.save();

		return { _id: postId };
	},
	storeProfile: async ({ input }: { input: IProfileInputDTO }, args: Request) => {
		const [data, errors] = validate(input, value => ({
			status: value('status')
				.notEmpty()
				.isLength({ min: 1, max: 150 }),
			skills: value('skills')
				.notEmpty()
				.isLength({ min: 1, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors);
		}

		// Build profile object
		const profileFields: any = {};
		profileFields['user'] = args.currentUser._id;
		if (input.company) profileFields.company = input.company;
		if (input.website) profileFields.website = input.website;
		if (input.location) profileFields.location = input.location;
		if (input.bio) profileFields.bio = input.bio;
		if (data.status) profileFields.status = data.status;
		if (input.githubusername) profileFields.githubusername = input.githubusername;
		if (data.skills) {
			profileFields.skills = data.skills.split(',').map(skill => skill.trim());
		}

		// Build social object
		profileFields['social'] = {};
		if (input.youtube) profileFields.social.youtube = input.youtube;
		if (input.twitter) profileFields.social.twitter = input.twitter;
		if (input.facebook) profileFields.social.facebook = input.facebook;
		if (input.linkedin) profileFields.social.linkedin = input.linkedin;
		if (input.instagram) profileFields.social.instagram = input.instagram;

		if (input.experience) {
			profileFields['experience'] = [];
			input.experience.forEach((element, index) => {
				const [data, errors] = validate(element, value => ({
					title: value('title')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					company: value('company')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					from: value('from')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
				}));
				if (Object.keys(errors).length > 0) {
					throw new ValidationError(errors);
				}
				profileFields['experience'].push({
					title: data.title,
					company: input.experience[index].company,
					location: input.experience[index].location,
					from: data.from,
					to: input.experience[index].to,
					current: input.experience[index].current,
					description: input.experience[index].description,
				});
			});
		}

		if (input.education) {
			profileFields['education'] = [];
			input.education.forEach((element, index) => {
				const [data, errors] = validate(element, value => ({
					school: value('school')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					degree: value('degree')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					fieldofstudy: value('fieldofstudy')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					from: value('from')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					to: value('to'),
					current: value('current'),
					description: value('description'),
				}));
				if (Object.keys(errors).length > 0) {
					throw new ValidationError(errors);
				}
				profileFields['education'].push({
					school: data.school,
					degree: data.degree,
					fieldofstudy: data.fieldofstudy,
					from: data.from,
					to: data.to,
					current: data.current,
					description: data.description,
				});
			});
		}

		try {
			const profileModel = Container.get('profileModel') as mongoose.Model<IPost & mongoose.Document>;
			// Using upsert option (creates new doc if no match is found):
			let profile = await profileModel.findOneAndUpdate(
				{ user: args.currentUser._id },
				{ $set: profileFields },
				{ new: true, upsert: true },
			);
			return profile;
		} catch (err) {
			throw new ValidationError(err);
		}
	},
	destroyProfile: async ({ profileId }: { profileId: string }, args: Request) => {
		const profileModel = Container.get('profileModel') as mongoose.Model<IProfile & mongoose.Document>;
		const profile = await profileModel.findOne({ _id: profileId });
		// Check profile
		if (!profile) {
			throw new Error('Profile Not Found');
		}
		// Check user
		if (profile.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		const profileObject = profile.toObject();
		await profile.remove();

		return profileObject;
	},
};
