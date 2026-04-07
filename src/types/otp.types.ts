export type SendOtpInput = {
	userId: string;
};

export type VerifyOtpInput = {
	userId: string;
	otp: string;
};

export type OtpEmailPayload = {
	to: string;
	name?: string;
	otp: string;
};
