import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate.middleware";
import {
	convertLeadToDealController,
	deleteDealController,
	listDealsController,
	updateDealStageController,
} from "./deal.controller";
import {
	validateConvertLeadToDealInput,
	validateDealListQuery,
	validateDealParams,
	validateUpdateDealStageInput,
} from "./deal.validation";

const dealRouter = Router();

dealRouter.use(authenticateUser, authorizeUserOnly);

dealRouter.post("/convert", validateBody(validateConvertLeadToDealInput), convertLeadToDealController);
dealRouter.get("/", validateQuery(validateDealListQuery), listDealsController);
dealRouter.put("/:dealId/stage", validateParams(validateDealParams), validateBody(validateUpdateDealStageInput), updateDealStageController);
dealRouter.delete("/:dealId", validateParams(validateDealParams), deleteDealController);

export default dealRouter;
