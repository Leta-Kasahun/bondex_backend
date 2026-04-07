import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate.middleware";
import {
	createBusinessController,
	deleteBusinessController,
	getBusinessByIdController,
	listBusinessesController,
	updateBusinessController,
} from "./business.controller";
import {
	validateBusinessListQuery,
	validateBusinessParams,
	validateCreateBusinessInput,
	validateUpdateBusinessInput,
} from "./business.validation";

const businessRouter = Router();

businessRouter.use(authenticateUser, authorizeUserOnly);

businessRouter.post("/", validateBody(validateCreateBusinessInput), createBusinessController);
businessRouter.get("/", validateQuery(validateBusinessListQuery), listBusinessesController);
businessRouter.get("/:businessId", validateParams(validateBusinessParams), getBusinessByIdController);
businessRouter.patch(
	"/:businessId",
	validateParams(validateBusinessParams),
	validateBody(validateUpdateBusinessInput),
	updateBusinessController
);
businessRouter.delete("/:businessId", validateParams(validateBusinessParams), deleteBusinessController);

export default businessRouter;
