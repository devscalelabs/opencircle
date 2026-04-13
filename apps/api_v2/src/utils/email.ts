import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const PLATFORM_URL = process.env.PLATFORM_URL || "http://localhost:3000";

const resend = new Resend(RESEND_API_KEY);

const FROM_EMAIL = "hello@devscale.id";

export async function sendPasswordResetEmail(
	email: string,
	code: string,
): Promise<void> {
	const resetUrl = `${PLATFORM_URL}/reset-password?code=${code}`;

	await resend.emails.send({
		from: FROM_EMAIL,
		to: email,
		subject: "Password Reset Request",
		html: `
      <p>You requested a password reset.</p>
      <p>Your reset code is: <strong>${code}</strong></p>
      <p>Or click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>This code expires in 1 hour.</p>
    `,
	});
}

export async function sendEmailVerification(
	email: string,
	code: string,
): Promise<void> {
	const verifyUrl = `${PLATFORM_URL}/verify-email?code=${code}`;

	await resend.emails.send({
		from: FROM_EMAIL,
		to: email,
		subject: "Verify Your Email",
		html: `
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Or click <a href="${verifyUrl}">here</a> to verify your email.</p>
      <p>This code expires in 24 hours.</p>
    `,
	});
}

export async function sendNotificationEmail(
	to: string,
	subject: string,
	html: string,
): Promise<void> {
	await resend.emails.send({
		from: FROM_EMAIL,
		to,
		subject,
		html,
	});
}
