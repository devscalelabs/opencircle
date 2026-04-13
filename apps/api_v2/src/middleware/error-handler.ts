import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof HTTPException) {
		return c.json(
			{
				error: err.message,
				status: err.status,
			},
			err.status,
		);
	}

	console.error("Unhandled error:", err);

	return c.json(
		{
			error: "Internal server error",
			status: 500,
		},
		500,
	);
};
