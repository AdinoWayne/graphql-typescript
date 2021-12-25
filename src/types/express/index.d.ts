import { Document, Model } from 'mongoose';
import { IEvent } from '../../interfaces/IEvent';
import { IPost } from '../../interfaces/IPost';
import { IProfile } from '../../interfaces/IProfiles';
import { IUser } from '../../interfaces/IUser';
declare global {
	namespace Express {
		export interface Request {
			currentUser: IUser & Document;
		}
	}

	namespace Models {
		export type UserModel = Model<IUser & Document>;
		export type PostModel = Model<IPost & Document>;
		export type ProfileModel = Model<IProfile & Document>;
		export type EventModel = Model<IEvent & Document>;
	}
}
