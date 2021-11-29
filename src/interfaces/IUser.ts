export interface IUser {
	_id: string;
	name: string;
	email: string;
	avatar: string;
	password: string;
	date: Date;
}

export interface IUserInputDTO {
	name: string;
	email: string;
	password: string;
}
