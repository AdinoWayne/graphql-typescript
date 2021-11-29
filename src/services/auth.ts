import { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import config from '../config';
import bcrypt from 'bcrypt';
import { IUser, IUserInputDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const gravatar = require('gravatar');

@Service()
export default class AuthService {
	constructor(
		@Inject('userModel') private userModel: Models.UserModel,
		@Inject('logger') private logger,
		@EventDispatcher() private eventDispatcher: EventDispatcherInterface,
	) {}

	public async SignUp(userInputDTO: IUserInputDTO): Promise<{ user: IUser; token: string }> {
		try {
			const { name, email, password } = userInputDTO;
			const store = await this.userModel.findOne({ email });
			this.logger.silly('Hashing password');
			const salt = await bcrypt.genSalt(10);
			const hashedPassword: string = await new Promise((resolve, reject) => {
				bcrypt.hash(password, salt, function(err, hash) {
					if (err) reject(err);
					resolve(hash);
				});
			});
			this.logger.silly('Hashing password');
			if (store) {
				throw new Error('User already exists');
			}
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm',
			});
			this.logger.silly('Creating user db record');
			let userRecord = new this.userModel({
				name,
				email,
				avatar,
				password: hashedPassword,
			});

			if (!userRecord) {
				throw new Error('User cannot be created');
			}

			const token = this.generateToken(userRecord);

			this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

			const user = userRecord.toObject();

			return { user, token };
		} catch (e) {
			this.logger.error(e);
			throw e;
		}
	}

	public async SignIn(email: string, password: string): Promise<{ user: IUser; token: string }> {
		const userRecord = await this.userModel.findOne({ email });
		if (!userRecord) {
			throw new Error('User not registered');
		}
		/**
		 * We use verify from bcrypt to prevent 'timing based' attacks
		 */
		this.logger.silly('Checking password');
		let validPassword = await new Promise((resolve, error) => {
			bcrypt.compare(password, userRecord.password, (err, success) => {
				if (err) {
					return error(err);
				}
				resolve(success);
			});
		});
		this.logger.debug('Validation : %o', validPassword);
		if (validPassword) {
			this.logger.silly('Password is valid!');
			this.logger.silly('Generating JWT');
			const token = this.generateToken(userRecord);

			this.eventDispatcher.dispatch(events.user.signIn, { _id: userRecord._id, email: userRecord.email });
			const user = userRecord.toObject();
			return { user, token };
		} else {
			throw new Error('Invalid Password');
		}
	}

	private generateToken(user) {
		const today = new Date();
		const exp = new Date(today);
		exp.setDate(today.getDate() + 60);

		/**
		 * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
		 * The cool thing is that you can add custom properties a.k.a metadata
		 * Beware that the metadata is public and can be decoded without _the secret_
		 * but the client cannot craft a JWT to fake a userId
		 * because it doesn't have _the secret_ to sign it
		 * more information here: https://softwareontheroad.com/you-dont-need-passport
		 */
		this.logger.silly(`Sign JWT for userId: ${user._id}`);
		return jwt.sign(
			{
				_id: user._id, // We are gonna use this in the middleware 'isAuth'
				name: user.name,
				exp: exp.getTime() / 1000,
			},
			config.jwtSecret,
		);
	}
}
