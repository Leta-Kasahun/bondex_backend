export type AdminLoginInput = {
	email: string;
	password: string;
};

export type AdminLoginResponse = {
	adminId: string;
	message: string;
};

export type AdminVerifyOtpInput = {
	adminId: string;
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
