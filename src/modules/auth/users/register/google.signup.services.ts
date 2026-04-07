import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { GoogleSignupBody, UserAuthSuccess } from "../auth.types";
import { googleLoginService } from "../login/login.services";

export type GoogleSignupResponse = UserAuthSuccess & {
	message: string;
};

export const googleSignupService = async (input: GoogleSignupBody): Promise<GoogleSignupResponse> => {
	const result = await googleLoginService(input);

	return {
		...result,
		message: AUTH_MESSAGES.GOOGLE_SIGNUP_SUCCESS,
	};
};
