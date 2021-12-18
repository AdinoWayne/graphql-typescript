import expressLoader from './express';
import mongooseLoader from './mongoose';
import { Container } from 'typedi';
import Logger from './logger';
import './events';
import LoggerInstance from './logger';

export default async ({ expressApp }) => {
	await mongooseLoader();
	Logger.info('DB loaded and connected!');
	const userModel = {
		name: 'userModel',
		model: require('../models/user').default,
	};
	const postModel = {
		name: 'postModel',
		model: require('../models/post').default,
	};
	const profileModel = {
		name: 'profileModel',
		model: require('../models/profile').default,
	};
	const eventModel = {
		name: 'eventModel',
		model: require('../models/event').default,
	};
	Container.set(userModel.name, userModel.model);
	Container.set(postModel.name, postModel.model);
	Container.set(profileModel.name, profileModel.model);
	Container.set(eventModel.name, eventModel.model);
	Container.set('logger', LoggerInstance);
	await expressLoader({ app: expressApp });
	Logger.info('Express loaded');
};
