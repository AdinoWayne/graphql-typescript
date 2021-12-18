export interface IEvent {
	_id: string;
	type: string;
	userId: string;
	postId: string;
	description: string;
	date: Date;
}
