import { IEvent } from '../interfaces/IEvent';
import mongoose from 'mongoose';

const Event = new mongoose.Schema({
	type: {
		type: String,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
	},
	postId: {
		type: mongoose.Schema.Types.ObjectId,
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
});

export default mongoose.model<IEvent & mongoose.Document>('Event', Event);
