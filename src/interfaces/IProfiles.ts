export interface IProfile {
	_id: string;
	user: string;
	company: string;
	website: string;
	location: string;
	status: string;
	skills: string[];
	bio: string;
	githubusername: string;
	experience: {
		title: string;
		company: string;
		location: string;
		from: Date;
		to: Date;
		current: boolean;
		description: string;
	}[];
	education: {
		school: string;
		degree: string;
		fieldofstudy: string;
		from: Date;
		to: Date;
		current: boolean;
		description: string;
	}[];
	social: {
		youtube: string;
		twitter: string;
		facebook: string;
		linkedin: string;
		instagram: string;
	};
	date: Date;
}

export interface IProfileInputDTO {
	status: string;
	skills: string;
	company?: string;
	website?: string;
	location?: string;
	bio?: string;
	githubusername?: string;
	youtube?: string;
	twitter?: string;
	facebook?: string;
	linkedin?: string;
	instagram?: string;
	experience?: {
		title: string;
		company: string;
		location: string;
		from: Date;
		to: Date;
		current: boolean;
		description: string;
	}[];
	education: {
		school: string;
		degree: string;
		fieldofstudy: string;
		from: Date;
		to: Date;
		current: boolean;
		description: string;
	}[];
}
