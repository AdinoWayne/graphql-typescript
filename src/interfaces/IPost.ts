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
