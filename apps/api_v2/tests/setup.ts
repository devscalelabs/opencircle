import { config } from "dotenv";

config({ path: ".env.test", override: true });

import { prisma } from "../src/utils/prisma";

beforeAll(async () => {
	await prisma.$connect();
});

afterAll(async () => {
	await prisma.$disconnect();
});
