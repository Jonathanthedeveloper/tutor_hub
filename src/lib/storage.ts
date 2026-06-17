import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import sanitize from "sanitize-filename";
import { v7 as uuidV7 } from "uuid";

// Extract env variables
const s3Endpoint = process.env.S3_ENDPOINT;
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const s3BucketName = process.env.S3_BUCKET_NAME;
const s3PublicUrl = process.env.S3_PUBLIC_URL;

// Determine if S3 is fully configured
const isS3Configured = !!(
  s3AccessKeyId &&
  s3SecretAccessKey &&
  s3BucketName
);

let s3Client: S3Client | null = null;

if (isS3Configured) {
  s3Client = new S3Client({
    endpoint: s3Endpoint || undefined,
    region: "auto", // works for Cloudflare R2 and generic endpoints
    credentials: {
      accessKeyId: s3AccessKeyId!,
      secretAccessKey: s3SecretAccessKey!,
    },
    // Required for some providers like R2/MinIO
    forcePathStyle: !!s3Endpoint,
  });
}

/**
 * Uploads a file to the configured S3 bucket, or falls back to local disk storage
 * @param file The HTML File object to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const sanitizedName = sanitize(file.name).replace(/\s+/g, "_");
  const fileName = `${sanitizedName}-${uuidV7()}`;

  if (isS3Configured && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: s3BucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      });

      await s3Client.send(command);

      // Construct URL
      if (s3PublicUrl) {
        // e.g. custom CDN or sub-domain R2 bucket
        return `${s3PublicUrl.replace(/\/$/, "")}/${fileName}`;
      } else if (s3Endpoint) {
        // e.g. minio or local s3 mock: http://localhost:9000/bucket/name
        const baseUrl = s3Endpoint.replace(/\/$/, "");
        return `${baseUrl}/${s3BucketName}/${fileName}`;
      } else {
        // Default AWS format
        return `https://${s3BucketName}.s3.amazonaws.com/${fileName}`;
      }
    } catch (error) {
      console.error("S3 upload failed, falling back to local storage:", error);
      // Fall through to local fallback in case of S3 errors
    }
  }

  // Local filesystem fallback
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Return relative URL serving from public static directory
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Local storage upload failed:", error);
    throw new Error("Failed to upload file to storage.");
  }
}
