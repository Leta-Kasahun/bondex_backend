export type RegisterUserBody = {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export type RegisterUserInput = {
	name: string;
	email: string;
	password: string;
};

export type LoginUserBody = {
	email: string;
	password: string;
};

export type LoginUserInput = LoginUserBody;

export type VerifyRegistrationOtpInput = {
	email: string;
	otp: string;
};

export type VerifyRegistrationOtpBody = VerifyRegistrationOtpInput;

export type GoogleSignupBody = {
	idToken: string;
};

export type GoogleLoginBody = GoogleSignupBody;

export type UserAuthSuccess = {
	userId: string;
	email: string;
	name: string;
	accessToken: string;
	refreshToken: string;
};
