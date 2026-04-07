import nodemailer from "nodemailer";
import { emailConfig } from "../config/email.config";
import { env } from "../config/env.config";
import { OTP_CONSTANTS } from "../constants/otp.constant";
import { OtpEmailPayload } from "../types/otp.types";

const transporter = nodemailer.createTransport({
	host: emailConfig.host,
	port: emailConfig.port,
	secure: emailConfig.secure,
	auth: emailConfig.auth,
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
	await transporter.sendMail({
		from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
		to,
		subject,
		html,
	});
};

const frontendBaseUrl = env.FRONTEND_URL || env.CLIENT_URL || "http://localhost:3000";

const otpCard = (title: string, bodyText: string, otp: string, footerText: string): string => `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8" />
		<style>
			body { margin: 0; padding: 0; background: #f4f6fb; font-family: Arial, sans-serif; }
			.wrap { max-width: 520px; margin: 24px auto; padding: 16px; }
			.card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08); }
			h2 { margin: 0 0 12px; color: #113a7d; }
			p { color: #333; line-height: 1.5; }
			.otp { display: inline-block; margin: 12px 0; padding: 10px 16px; border-radius: 8px; background: #e9f2ff; color: #0b3f91; font-size: 24px; letter-spacing: 4px; font-weight: 700; }
			.note { margin-top: 14px; color: #6b7280; font-size: 12px; }
		</style>
	</head>
	<body>
		<div class="wrap">
			<div class="card">
				<h2>${title}</h2>
				<p>${bodyText}</p>
				<div class="otp">${otp}</div>
				<p>${footerText}</p>
				<p class="note">This code expires in ${OTP_CONSTANTS.EXPIRY_MINUTES} minutes.</p>
			</div>
		</div>
	</body>
	</html>
`;

export const sendOtpEmail = async ({ to, name, otp }: OtpEmailPayload): Promise<void> => {
	const title = name ? `Hello ${name}` : "Hello";
	const html = otpCard(
		title,
		"Use the verification code below to continue your sign-in.",
		otp,
		"If you did not request this code, you can safely ignore this email."
	);
	await sendEmail(to, OTP_CONSTANTS.SUBJECT, html);
};

export const sendPasswordResetOtpEmail = async ({
	to,
	name,
	otp,
}: OtpEmailPayload): Promise<void> => {
	const title = name ? `Hello ${name}` : "Hello";
	const html = otpCard(
		title,
		"Use the verification code below to reset your password.",
		otp,
		"If you did not request a password reset, please ignore this email."
	);
	await sendEmail(to, "Bondex password reset code", html);
};

// ============ NOTIFICATION EMAILS (Blue/Indigo Gradients) ============

interface NotificationEmailParams {
	to: string;
	businessName: string;
	leadName: string;
	leadId: string;
	platform: string;
	messagePreview?: string;
}

const emailStyles = `
	<style>
			body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #eef2f7; }
		.container { max-width: 500px; margin: 40px auto; padding: 20px; }
		.card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
		h2 { color: #1a365d; margin: 0 0 20px 0; border-left: 4px solid #1a365d; padding-left: 15px; }
		.info { background: #ebf4ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
		.label { font-weight: bold; color: #1a365d; }
		.button { background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 15px 0; }
		.footer { margin-top: 20px; font-size: 11px; color: #888; text-align: center; }
		.highlight { color: #d4380d; font-weight: bold; }
		.warning { color: #c0392b; font-weight: bold; }
			.preview { margin-top: 10px; font-size: 13px; color: #3d4a63; }
	</style>
`;

export const sendNewLeadEmail = async (params: NotificationEmailParams): Promise<void> => {
	const html = `
		<!DOCTYPE html>
		<html>
		<head><meta charset="UTF-8">${emailStyles}</head>
		<body>
			<div class="container">
				<div class="card">
					<h2>✨ New Lead</h2>
					<p><strong>${params.businessName}</strong> has a new lead.</p>
					<div class="info">
						<div><span class="label">Customer:</span> ${params.leadName}</div>
						<div><span class="label">Platform:</span> ${params.platform}</div>
						<div><span class="label">Time:</span> ${new Date().toLocaleString()}</div>
						${params.messagePreview ? `<div class="preview"><span class="label">Message:</span> ${params.messagePreview}</div>` : ""}
					</div>
					<div style="text-align: center;">
						<a href="${frontendBaseUrl}/leads/${params.leadId}" class="button">View Lead</a>
					</div>
					<div class="footer">Reply quickly to convert.</div>
				</div>
			</div>
		</body>
		</html>
	`;
	await sendEmail(params.to, `New Lead: ${params.leadName}`, html);
};

export const sendHighPriorityEmail = async (params: NotificationEmailParams): Promise<void> => {
	const html = `
		<!DOCTYPE html>
		<html>
		<head><meta charset="UTF-8">${emailStyles}</head>
		<body>
			<div class="container">
				<div class="card">
					<h2 style="border-left-color: #d4380d;">🔥 High Priority</h2>
					<p><strong>${params.leadName}</strong> is <span class="highlight">ready to buy now</span>.</p>
					<div class="info">
						<div><span class="label">Business:</span> ${params.businessName}</div>
						<div><span class="label">Platform:</span> ${params.platform}</div>
						${params.messagePreview ? `<div class="preview"><span class="label">Message:</span> ${params.messagePreview}</div>` : ""}
					</div>
					<div style="text-align: center;">
						<a href="${frontendBaseUrl}/leads/${params.leadId}" class="button">Reply Now</a>
					</div>
					<div class="footer">Respond immediately.</div>
				</div>
			</div>
		</body>
		</html>
	`;
	await sendEmail(params.to, `🔥 High Priority: ${params.leadName}`, html);
};

export const sendStaleLeadEmail = async (params: NotificationEmailParams): Promise<void> => {
	const html = `
		<!DOCTYPE html>
		<html>
		<head><meta charset="UTF-8">${emailStyles}</head>
		<body>
			<div class="container">
				<div class="card">
					<h2 style="border-left-color: #c0392b;">⚠️ Urgent: Stale Lead</h2>
					<p><strong>${params.leadName}</strong> has <span class="warning">not been contacted for 1 hour</span>.</p>
					<div class="info">
						<div><span class="label">Business:</span> ${params.businessName}</div>
						<div><span class="label">Platform:</span> ${params.platform}</div>
						${params.messagePreview ? `<div class="preview"><span class="label">Message:</span> ${params.messagePreview}</div>` : ""}
					</div>
					<div style="text-align: center;">
						<a href="${frontendBaseUrl}/leads/${params.leadId}" class="button">Reply Immediately</a>
					</div>
					<div class="footer">You may lose this customer.</div>
				</div>
			</div>
		</body>
		</html>
	`;
	await sendEmail(params.to, `⚠️ Urgent: ${params.leadName} waiting`, html);
};