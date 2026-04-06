export type {
	AuthTokenPayload,
	UserTokenPayload,
	AdminTokenPayload,
	VerifiedAuthTokenPayload,
} from "../types/jwt.types";

export {
	generateAccessToken,
	generateRefreshToken,
	generateTokenPair,
	generateUserTokenPair,
	generateAdminTokenPair,
} from "./jwt/jwt.create";

export {
	verifyAccessToken,
	verifyRefreshToken,
	verifyUserAccessToken,
	verifyAdminAccessToken,
} from "./jwt/jwt.verify";

export {
	USER_REFRESH_TOKEN_COOKIE_NAME,
	ADMIN_REFRESH_TOKEN_COOKIE_NAME,
	setUserRefreshTokenCookie,
	clearUserRefreshTokenCookie,
	setAdminRefreshTokenCookie,
	clearAdminRefreshTokenCookie,
} from "./jwt/jwt.cookie";

export const REFRESH_TOKEN_COOKIE_NAME = "userRefreshToken";
export { setUserRefreshTokenCookie as setRefreshTokenCookie } from "./jwt/jwt.cookie";
export { clearUserRefreshTokenCookie as clearRefreshTokenCookie } from "./jwt/jwt.cookie";
