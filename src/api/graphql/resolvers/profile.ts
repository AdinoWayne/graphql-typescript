import { Request } from 'express';
import { Container } from 'typedi';
import { IProfileInputDTO } from '../../../interfaces/IProfiles';
import ProfileService from '../../../services/profile';

export const profileResolvers = {
	profiles: async () => {
        try {
			const profileServiceInstance = Container.get(ProfileService);
			return await profileServiceInstance.getAllProfiles();
		} catch (error) {
			throw new Error(error);
		}
	},
	profile: async (_id: string) => {
        try {
			const profileServiceInstance = Container.get(ProfileService);
			return await profileServiceInstance.getDetailProfile(_id);
		} catch (error) {
			throw new Error(error);
		}
	},
	storeProfile: async ({ input }: { input: IProfileInputDTO }, args: Request) => {
        try {
			const profileServiceInstance = Container.get(ProfileService);
			return await profileServiceInstance.storeProfile(input, args);
		} catch (error) {
			throw new Error(error);
		}
	},
	destroyProfile: async ({ profileId }: { profileId: string }, args: Request) => {
        try {
			const profileServiceInstance = Container.get(ProfileService);
			return await profileServiceInstance.destroyProfile(profileId, args);
		} catch (error) {
			throw new Error(error);
		}
	},
}