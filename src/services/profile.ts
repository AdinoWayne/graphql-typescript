import { Request } from 'express';
import { Service, Inject } from 'typedi';
import { validate, ValidationError } from 'validator-fluent';
import { IProfileInputDTO } from '../interfaces/IProfiles';

@Service()
export default class ProfileService {
	constructor(
		@Inject('profileModel') private profileModel: Models.ProfileModel,
		@Inject('logger') private logger,
	) {}

    public async getAllProfiles() {
		const profiles = await this.profileModel.find({});
		return profiles;
    }

    public async getDetailProfile(profileId: string) {
		const profile = this.profileModel.findOne({ _id: profileId });
		return profile;
    }

    public async destroyProfile(profileId: string, args: Request) {
		const profile = await this.profileModel.findOne({ _id: profileId });
		// Check profile
		if (!profile) {
			throw new Error('Profile Not Found');
		}
		// Check user
		if (profile.user.toString() !== args.currentUser._id.toString()) {
			throw new Error('User not authorized');
		}
		const profileObject = profile.toObject();
		await profile.remove();

		return profileObject;
    }

    public async storeProfile(input: IProfileInputDTO, args: Request) {
		const [data, errors] = validate(input, value => ({
			status: value('status')
				.notEmpty()
				.isLength({ min: 1, max: 150 }),
			skills: value('skills')
				.notEmpty()
				.isLength({ min: 1, max: 50 }),
		}));
		if (Object.keys(errors).length > 0) {
			throw new ValidationError(errors);
		}

		// Build profile object
		const profileFields: any = {};
		profileFields['user'] = args.currentUser._id;
		if (input.company) profileFields.company = input.company;
		if (input.website) profileFields.website = input.website;
		if (input.location) profileFields.location = input.location;
		if (input.bio) profileFields.bio = input.bio;
		if (data.status) profileFields.status = data.status;
		if (input.githubusername) profileFields.githubusername = input.githubusername;
		if (data.skills) {
			profileFields.skills = data.skills.split(',').map(skill => skill.trim());
		}

		// Build social object
		profileFields['social'] = {};
		if (input.youtube) profileFields.social.youtube = input.youtube;
		if (input.twitter) profileFields.social.twitter = input.twitter;
		if (input.facebook) profileFields.social.facebook = input.facebook;
		if (input.linkedin) profileFields.social.linkedin = input.linkedin;
		if (input.instagram) profileFields.social.instagram = input.instagram;

		if (input.experience) {
			profileFields['experience'] = [];
			input.experience.forEach((element, index) => {
				const [data, errors] = validate(element, value => ({
					title: value('title')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					company: value('company')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					from: value('from')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
				}));
				if (Object.keys(errors).length > 0) {
					throw new ValidationError(errors);
				}
				profileFields['experience'].push({
					title: data.title,
					company: input.experience[index].company,
					location: input.experience[index].location,
					from: data.from,
					to: input.experience[index].to,
					current: input.experience[index].current,
					description: input.experience[index].description,
				});
			});
		}

		if (input.education) {
			profileFields['education'] = [];
			input.education.forEach((element, index) => {
				const [data, errors] = validate(element, value => ({
					school: value('school')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					degree: value('degree')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					fieldofstudy: value('fieldofstudy')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					from: value('from')
						.notEmpty()
						.isLength({ min: 1, max: 150 }),
					to: value('to'),
					current: value('current'),
					description: value('description'),
				}));
				if (Object.keys(errors).length > 0) {
					throw new ValidationError(errors);
				}
				profileFields['education'].push({
					school: data.school,
					degree: data.degree,
					fieldofstudy: data.fieldofstudy,
					from: data.from,
					to: data.to,
					current: data.current,
					description: data.description,
				});
			});
		}

		try {
			// Using upsert option (creates new doc if no match is found):
			let profile = await this.profileModel.findOneAndUpdate(
				{ user: args.currentUser._id },
				{ $set: profileFields },
				{ new: true, upsert: true },
			);
			return profile;
		} catch (err) {
			throw new ValidationError(err);
		}
    }
}
