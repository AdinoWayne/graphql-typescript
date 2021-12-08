export interface IPost {
	_id: string;
	text: string;
	name: string;
	avatar: string;
	user: any;
	likes: {
		_id?: string;
		user: string;
		type?: number;
	}[];
	comments: {
		_id?: string;
		text: string;
		name: string;
		avatar: string;
		user: any;
		date?: Date;
	}[];
	date: Date;
}

export interface IPostInputDTO {
	text: string;
}

export interface ILikeInputDTO {
	_id?: string;
	type?: likeType;
}

export enum likeType {
	Like = 1,
	DisLike = 2,
}
