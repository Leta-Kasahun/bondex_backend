import { DEAL_STAGE_VALUES } from "../../constants/deal.constant";

export type DealStage = (typeof DEAL_STAGE_VALUES)[number];

export interface ConvertLeadToDealBody {
	leadId: string;
	name: string;
	value?: number;
}

export interface ConvertLeadToDealInput extends ConvertLeadToDealBody {}

export interface DealListQuery {
	businessId: string;
	page?: number;
	limit?: number;
	stage?: DealStage;
	search?: string;
}

export interface DealListInput {
	businessId: string;
	page: number;
	limit: number;
	stage?: DealStage;
	search?: string;
}

export interface DealParams {
	dealId: string;
}

export interface UpdateDealStageBody {
	stage: DealStage;
	value?: number;
}

export interface UpdateDealStageInput extends UpdateDealStageBody {}

export interface DealView {
	id: string;
	businessId: string;
	leadId: string;
	name: string;
	value: number | null;
	stage: DealStage;
	closedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}
