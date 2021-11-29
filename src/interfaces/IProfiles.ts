export interface IProfile {
	_id: string;
	user: string;
	company: string;
	website: string;
	location: string;
	status: string;
	skills: Array<string>;
	bio: string;
	githubusername: string;
	experience: Array<{
		title: string;
		company: string;
		location: string;
		from: Date;
		to: Date;
		current: Boolean;
		description: string;
	}>
	education: Array<{
		school: string;
		degree: string;
		fieldofstudy: string;
		from: Date;
		to: Date;
		current: Boolean;
		description: string;
	}>,
	social: {
		youtube: string,
		twitter: string,
		facebook: string,
		linkedin: string,
		instagram: string
	},
	date: Date;
}

export interface IProfileInputDTO {
	text: string;
}
