import { IEvent } from '../interfaces/IEvent';
import mongoose from 'mongoose';

const Event = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
	},
	events: [
		{
			postId: {
				type: mongoose.Schema.Types.ObjectId,
			},
			type: {
				type: String,
			},
			description: {
				type: String,
			},
			isRead: {
				type: Boolean
			},
			date: {
				type: Date,
				default: Date.now,
			},
		}
	],
	date: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model<IEvent & mongoose.Document>('Event', Event);
