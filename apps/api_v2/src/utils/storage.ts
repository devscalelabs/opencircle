import {
	S3Client,
	PutObjectCommand,
	type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const R2_ENDPOINT_URL = process.env.R2_ENDPOINT_URL || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

const s3 = new S3Client({
	region: "auto",
	endpoint: R2_ENDPOINT_URL,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY,
	},
});

export async function uploadFile(
	file: { name: string; type: string; data: Buffer },
	folder = "uploads",
): Promise<string> {
	const ext = file.name.split(".").pop() || "";
	const filename = `${folder}/${nanoid()}.${ext}`;

	const params: PutObjectCommandInput = {
		Bucket: R2_BUCKET_NAME,
		Key: filename,
		Body: file.data,
		ContentType: file.type,
	};

	await s3.send(new PutObjectCommand(params));

	return `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}/${filename}`;
}
