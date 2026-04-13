import { nanoid } from "nanoid";

export function generateId(): string {
	return nanoid(24);
}
