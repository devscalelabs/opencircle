import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.SECRET_KEY || "your-secret-key";
const REFRESH_SECRET =
	process.env.REFRESH_TOKEN_SECRET_KEY || "your-refresh-secret-key";
const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRE_MINUTES
	? Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) * 60
	: 900;
const REFRESH_EXPIRES_DAYS = process.env.REFRESH_TOKEN_EXPIRE_DAYS
	? Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS)
	: 30;

type AccessPayload = {
	sub: string;
	type: "access";
};

type RefreshPayload = {
	sub: string;
	type: "refresh";
};

export function signAccessToken(username: string): string {
	const payload: AccessPayload = { sub: username, type: "access" };
	return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(username: string): string {
	const payload: RefreshPayload = { sub: username, type: "refresh" };
	return jwt.sign(payload, REFRESH_SECRET, {
		expiresIn: `${REFRESH_EXPIRES_DAYS}d`,
	});
}

export function verifyAccessToken(token: string): AccessPayload | null {
	try {
		return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
	} catch {
		return null;
	}
}

export function verifyRefreshToken(token: string): RefreshPayload | null {
	try {
		return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
	} catch {
		return null;
	}
}

export function hashToken(token: string): string {
	const crypto = require("crypto");
	return crypto.createHash("sha256").update(token).digest("hex");
}
