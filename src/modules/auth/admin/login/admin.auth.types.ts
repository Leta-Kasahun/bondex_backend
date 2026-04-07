export type AdminLoginInput = {
	email: string;
	password: string;
};

export type AdminLoginResponse = {
	message: string;
};

export type AdminVerifyOtpInput = {
	email: string;
	otp: string;
};

export type AdminVerifyOtpResponse = {
	userId: string;
	email: string;
	name: string;
	accessToken: string;
	refreshToken: string;
	message: string;
};
