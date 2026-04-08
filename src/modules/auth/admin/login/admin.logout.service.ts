import prisma from "../../../../config/prisma";

export const logoutAdminAuthService = async (refreshToken?: string): Promise<void> => {
	if (!refreshToken) {
		return;
	}

	await prisma.adminSession.updateMany({
		where: { refreshToken, revokedAt: null },
		data: { revokedAt: new Date() },
	});
};
