export interface IPost {
	_id: string;
	text: string;
	name: string;
	avatar: string;
	user: any;
	likes: {
		_id: string;
		user: any;
	}[];
	comments: {
		_id: string;
		text: string;
		name: string;
		avatar: string;
		user: any;
		date: Date;
	}[];
	date: Date;
}

export interface IPostInputDTO {
	text: string;
}

export interface ILikeInputDTO {
	_id: string;
	type: likeType;
	modelType: modelType;
}

export enum likeType {
	Like = 1,
	DisLike = 2,
}

export enum modelType {
	Post = 1,
	Comment = 2,
}
