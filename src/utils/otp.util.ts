import { OTP_CONSTANTS } from "../constants/otp.constant";

export const generateOtpCode = (): string => {
	const min = 10 ** (OTP_CONSTANTS.LENGTH - 1);
	const max = 10 ** OTP_CONSTANTS.LENGTH - 1;
	return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export const getOtpExpiryDate = (): Date =>
	new Date(Date.now() + OTP_CONSTANTS.EXPIRY_MINUTES * 60 * 1000);
