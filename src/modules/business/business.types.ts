export type CreateBusinessBody = {
	name: string;
	type?: string;
	description?: string;
	logo?: string;
};

export type CreateBusinessInput = CreateBusinessBody;

export type UpdateBusinessBody = {
	name?: string;
	type?: string;
	description?: string;
	logo?: string;
};

export type UpdateBusinessInput = UpdateBusinessBody;

export type BusinessParams = {
	businessId: string;
};

export type BusinessListQuery = {
	page?: number;
	limit?: number;
	search?: string;
};

export type BusinessListInput = {
	page: number;
	limit: number;
	search?: string;
};

export type BusinessView = {
	id: string;
	name: string;
	type: string | null;
	description: string | null;
	logo: string | null;
	ownerId: string;
	createdAt: Date;
	updatedAt: Date;
};
