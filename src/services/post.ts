import { Request } from 'express';
import { Service, Inject } from 'typedi';
import { validate, ValidationError } from 'validator-fluent';
import { pubsub } from '../api/graphql/subscriptions';
import { IPostInputDTO } from '../interfaces/IPost';

@Service()
export default class PostService {
	constructor(
		@Inject('postModel') private postModel: Models.PostModel,
		@Inject('eventModel') private eventModel: Models.EventModel,
		@Inject('logger') private logger,
	) {}

    public async getAllPost() {
        const posts = await this.postModel.find({});
		return posts;
    }

    public async getDetailPost(postId: string) {
		const post = await this.postModel.findOne({ _id: postId });
		return post;
    }

    public async storeComment(input: IPostInputDTO, postId: string, args: Request) {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 2, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}

		const post = await this.postModel.findOne({ _id: postId });
		const newComment = {
			text: data.text,
			name: args.currentUser.name,
			avatar: args.currentUser.avatar,
			user: args.currentUser._id,
		};
		post.comments.unshift(newComment);
		const idNewComment = post.comments[0];
		pubsub.publish('commentAdded', { commentAdded: idNewComment, postId });
		await post.save();

		return post;
    }

    public async toggleLike(postId: string, args: Request) {
		const post = await this.postModel.findOne({ _id: postId });
		if (!post) {
			throw new Error('Post Not Found');
		}
		// Check if the post has already been liked
		if (post.likes.filter(like => like.user.toString() === args.currentUser._id.toString()).length === 0) {
			post.likes.unshift({ user: args.currentUser._id });
		} else {
			// Get remove index
			const removeIndex = post.likes.map(like => like.user.toString()).indexOf(args.currentUser._id);
			post.likes.splice(removeIndex, 1);
		}
		await post.save();
		return post;
    }

    public async destroyPostLike(postId: string, args: Request) {
		const post = await this.postModel.findOne({ _id: postId });
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

		return post;
    }

    public async destroyPost(postId: string, args: Request) {
		const post = await this.postModel.findOne({ _id: postId });
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
    }

    public async destroyArrPost(postIds: string[], args: Request) {

		const posts = await this.postModel.find({
			_id: {
				$in: postIds,
			},
		});
		// Check post
		if (!posts) {
			throw new Error('Post Not Found');
		}
		posts.forEach(element => {
			// Check user
			if (element.user.toString() !== args.currentUser._id.toString()) {
				throw new Error('User not authorized');
			}
		});
		await this.postModel.remove({
			_id: {
				$in: postIds,
			},
		});
		return { msg: 'Delete Successfully!' };
    }

    public async updatePost(input: IPostInputDTO, postId: string, args: Request) {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 8, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}
		const post = await this.postModel.findOne({ _id: postId });
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
    }

    public async storePost(input: IPostInputDTO, args: Request) {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 2, max: 1000 }),
			tags: value('tags')
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}
		const PostModel = this.postModel;
		if (!data.tags) {
			data.tags = [];
		}
		const post = new PostModel({
			text: data.text,
			tags: data.tags,
			name: args.currentUser.name,
			avatar: args.currentUser.avatar,
			user: args.currentUser._id,
		});
		post.save();
		return post;
    }

    public async searchPosts(filter: any) {
		let query = {};
		if (filter.startDate || filter.endDate) {
			query = {
				date: {
					$gte: new Date(filter.startDate),
					$lte: new Date(filter.endDate),
				},
			};
		}
		if (filter.name) {
			query['name'] = filter.name;
		}
		const posts = await this.postModel.find(query)
			.limit(10)
			.skip(filter.page ? parseInt(filter.page, 10) : 1)
			.exec();
		return posts;
    }

	public async storePostLike(postId: string, args: Request) {
        const post = await this.postModel.findOne({ _id: postId });
        if (!post) {
            throw new Error('Post Not Found');
        }

        if (post.likes.filter(like => like.user.toString() === args.currentUser._id.toString()).length > 0) {
            throw new Error('Post already liked');
        }

        const event = new this.eventModel({
            type: 'LIKE',
            userId: args.currentUser._id,
            postId: postId,
            description: '',
        });

        event.save();

        post.likes.unshift({ user: args.currentUser._id });

        await post.save();

        return post;
	}

    public async updateComment(input: IPostInputDTO, postId: string, commentId: string, args: Request) {
		const [data, errors] = validate(input, value => ({
			text: value('text')
				.notEmpty()
				.isLength({ min: 8, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors, errors['text'][0]);
		}
		const post = await this.postModel.findOne({ _id: postId });
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
    }

    public async destroyComment(postId: string, commentId: string, args: Request) {
		const post = await this.postModel.findOne({ _id: postId });
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
    }

}
