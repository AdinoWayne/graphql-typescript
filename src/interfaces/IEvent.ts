export interface IEvent {
	_id: string;
	userId: string;
	events: {
		_id?: string;
		postId?: string;
		type?: string;
		isRead?: boolean;
		description?: string;
		date?: Date;
	}[];
	date?: Date;
}
