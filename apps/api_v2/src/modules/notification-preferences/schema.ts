import { z } from "zod";

const notificationFrequency = z.enum(["immediate", "daily", "weekly", "none"]);

export const notificationPreferencesUpdateSchema = z.object({
	mentionEmail: notificationFrequency.optional(),
	likeEmail: notificationFrequency.optional(),
	replyEmail: notificationFrequency.optional(),
});

export type NotificationPreferencesUpdate = z.infer<
	typeof notificationPreferencesUpdateSchema
>;
