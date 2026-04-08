import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate.middleware";
import {
	disconnectGmailController,
	getGmailConnectionStatusController,
	sendGmailReplyController,
} from "./gmail.controller";
import {
	validateGmailBusinessParams,
	validateGmailDisconnectInput,
	validateGmailReplyInput,
} from "./gmail.validation";

const gmailRouter = Router();

gmailRouter.use(authenticateUser, authorizeUserOnly);

gmailRouter.get("/status/:businessId", validateParams(validateGmailBusinessParams), getGmailConnectionStatusController);
gmailRouter.post("/disconnect", validateBody(validateGmailDisconnectInput), disconnectGmailController);
gmailRouter.post("/reply", validateBody(validateGmailReplyInput), sendGmailReplyController);

export default gmailRouter;
