import { Request } from 'express';
import { Container } from 'typedi';
import { IPostInputDTO } from '../../../interfaces/IPost';

import PostService from '../../../services/post';

export const postResolvers = {
    posts: async () => {
		try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.getAllPost();
		} catch (error) {
			throw new Error(error);
		}
	},
	event: async (_id: string) => {
		try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.getEvent(_id);
		} catch (error) {
			throw new Error(error);
		}
	},
    searchPosts: async ({ filter }: { filter: any }) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.searchPosts(filter);
		} catch (error) {
			throw new Error(error);
		}
	},
    post: async (_id: string) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.getDetailPost(_id);
		} catch (error) {
			throw new Error(error);
		}
	},
    storePost: async ({ input }: { input: IPostInputDTO }, args: Request) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.storePost(input, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    updatePost: async ({ postId, input }: { postId: string; input: IPostInputDTO }, args: Request) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.updatePost(input, postId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    destroyPost: async ({ postId }: { postId: string }, args: Request) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.destroyPost(postId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    destroyArrPost: async ({ postIds }: { postIds: string[] }, args: Request) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.destroyArrPost(postIds, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    storePostLike: async ({ postId }: { postId: string }, args: Request) => {
		try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.storePostLike(postId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    destroyPostLike: async ({ postId }: { postId: string }, args: Request) => {
		try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.destroyPostLike(postId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    toggleLike: async ({ postId }: { postId: string }, args: Request) => {
		try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.toggleLike(postId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    storeComment: async ({ postId, input }: { postId: string; input: IPostInputDTO }, args: Request) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.storeComment(input, postId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
    updateComment: async (
		{ postId, commentId, input }: { postId: string; commentId: string; input: IPostInputDTO },
		args: Request,
	) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.updateComment(input, postId, commentId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
	destroyComment: async ({ postId, commentId }: { postId: string; commentId: string }, args: Request) => {
        try {
			const postServiceInstance = Container.get(PostService);
			return await postServiceInstance.destroyComment(postId, commentId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
}