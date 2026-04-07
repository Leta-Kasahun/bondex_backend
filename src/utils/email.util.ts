import nodemailer from "nodemailer";
import { emailConfig } from "../config/email.config";
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

export const sendOtpEmail = async ({ to, name, otp }: OtpEmailPayload): Promise<void> => {
	const title = name ? `Hello ${name},` : "Hello,";
	const html = `<p>${title}</p><p>Your OTP is <b>${otp}</b>.</p><p>It expires in ${OTP_CONSTANTS.EXPIRY_MINUTES} minutes.</p>`;
	await sendEmail(to, OTP_CONSTANTS.SUBJECT, html);
};

export const sendPasswordResetOtpEmail = async ({
	to,
	name,
	otp,
}: OtpEmailPayload): Promise<void> => {
	const title = name ? `Hello ${name},` : "Hello,";
	const html = `<p>${title}</p><p>Your password reset OTP is <b>${otp}</b>.</p><p>It expires in ${OTP_CONSTANTS.EXPIRY_MINUTES} minutes.</p><p>If you did not request this, please ignore this email.</p>`;
	await sendEmail(to, "Bondex password reset code", html);
};

