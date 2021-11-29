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
	Container.set(userModel.name, userModel.model);
	Container.set('logger', LoggerInstance);
	await expressLoader({ app: expressApp });
	Logger.info('Express loaded');
};
