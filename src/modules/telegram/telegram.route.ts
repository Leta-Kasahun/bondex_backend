import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate.middleware";
import {
	connectTelegramController,
	disconnectTelegramController,
	getTelegramThreadController,
	sendTelegramReplyController,
	telegramWebhookController,
} from "./telegram.controller";
import {
	validateConnectTelegramInput,
	validateDisconnectTelegramInput,
	validateSendTelegramReplyInput,
	validateTelegramLeadParams,
	validateTelegramWebhookParams,
} from "./telegram.validation";

const telegramRouter = Router();

telegramRouter.post("/webhook/:businessId", validateParams(validateTelegramWebhookParams), telegramWebhookController);

telegramRouter.use(authenticateUser, authorizeUserOnly);
telegramRouter.post("/connect", validateBody(validateConnectTelegramInput), connectTelegramController);
telegramRouter.post("/disconnect", validateBody(validateDisconnectTelegramInput), disconnectTelegramController);
telegramRouter.post("/reply", validateBody(validateSendTelegramReplyInput), sendTelegramReplyController);
telegramRouter.get("/leads/:leadId/thread", validateParams(validateTelegramLeadParams), getTelegramThreadController);

export default telegramRouter;
