import { AuthSubject } from "./jwt.types";

declare global {
	namespace Express {
		interface Request {
			auth?: {
				id: string;
				type: AuthSubject;
				role?: string;
				email?: string;
			};
		}
	}
}

export {};

