import { IEvent } from '../interfaces/IEvent';
import mongoose from 'mongoose';

const Event = new mongoose.Schema({
	type: {
		type: String,
	},
	userId: {
		type: String,
	},
	postId: {
		type: String,
	},
	description: {
		type: String,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model<IEvent & mongoose.Document>('Event', Event);
