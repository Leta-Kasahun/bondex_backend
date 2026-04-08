import { Router } from "express";
import { validateBody, validateParams } from "../../middlewares/validate.middleware";
import {
	getPublicBusinessByIdController,
	listPublicBusinessesController,
	submitPublicContactController,
} from "./public.controller";
import { validatePublicBusinessParams, validatePublicContactInput } from "./public.validation";

const publicRouter = Router();

publicRouter.get("/businesses", listPublicBusinessesController);
publicRouter.get("/businesses/:id", validateParams(validatePublicBusinessParams), getPublicBusinessByIdController);
publicRouter.post("/contact", validateBody(validatePublicContactInput), submitPublicContactController);

export default publicRouter;
