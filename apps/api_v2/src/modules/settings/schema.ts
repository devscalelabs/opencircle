import { z } from "zod";

export const settingsUpdateSchema = z.object({
	appName: z.string().min(1).optional(),
	enableSignUp: z.boolean().optional(),
	enableOpencircleBranding: z.boolean().optional(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
