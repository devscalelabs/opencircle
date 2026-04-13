import { z } from "zod";

export const sessionIdSchema = z.object({
	sessionId: z.string().uuid(),
});
