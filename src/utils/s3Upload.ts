import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_REGION = import.meta.env.VITE_AWS_REGION as string | undefined;
const AWS_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET as string | undefined;
const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID as
  | string
  | undefined;
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY as
  | string
  | undefined;
const AWS_PUBLIC_BASE_URL = import.meta.env
  .VITE_AWS_S3_PUBLIC_BASE_URL as string | undefined;

type UploadOptions = {
  folder?: string;
  key?: string;
  contentType?: string;
  publicRead?: boolean;
};

const requireEnv = (name: string, value?: string) => {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const sanitizeFileName = (name: string) =>
  name.replace(/[^A-Za-z0-9._-]/g, "-");

const getUniqueId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const buildPublicUrl = (bucket: string, region: string, key: string) => {
  if (AWS_PUBLIC_BASE_URL) {
    return `${AWS_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }
  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

export const getPublicUrlForKey = (key: string) => {
  const region = requireEnv("VITE_AWS_REGION", AWS_REGION);
  const bucket = requireEnv("VITE_AWS_S3_BUCKET", AWS_BUCKET);
  return buildPublicUrl(bucket, region, key);
};

export const extractS3KeyFromUrl = (url: string) => {
  try {
    if (AWS_PUBLIC_BASE_URL && url.startsWith(AWS_PUBLIC_BASE_URL)) {
      return url.slice(AWS_PUBLIC_BASE_URL.replace(/\/$/, "").length + 1);
    }

    const region = requireEnv("VITE_AWS_REGION", AWS_REGION);
    const bucket = requireEnv("VITE_AWS_S3_BUCKET", AWS_BUCKET);
    const parsed = new URL(url);

    const host = parsed.host;
    const bucketHostRegional = `${bucket}.s3.${region}.amazonaws.com`;
    const bucketHostUsEast1 = `${bucket}.s3.amazonaws.com`;

    if (host === bucketHostRegional || host === bucketHostUsEast1) {
      return parsed.pathname.replace(/^\//, "");
    }
  } catch {
    // ignore parse errors
  }

  return null;
};

export const uploadFileToS3 = async (
  file: File,
  options: UploadOptions = {}
) => {
  const region = requireEnv("VITE_AWS_REGION", AWS_REGION);
  const bucket = requireEnv("VITE_AWS_S3_BUCKET", AWS_BUCKET);
  const accessKeyId = requireEnv("VITE_AWS_ACCESS_KEY_ID", AWS_ACCESS_KEY_ID);
  const secretAccessKey = requireEnv(
    "VITE_AWS_SECRET_ACCESS_KEY",
    AWS_SECRET_ACCESS_KEY
  );

  const folder = options.folder?.replace(/^\//, "").replace(/\/$/, "");
  const safeName = sanitizeFileName(file.name || "file");
  const key =
    options.key ||
    `${folder ? `${folder}/` : ""}${getUniqueId()}-${safeName}`;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: options.contentType || file.type || "application/octet-stream",
    ...(options.publicRead ? { ACL: "public-read" } : {}),
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });
  const uploadResponse = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": options.contentType || file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text().catch(() => "");
    const message = errorText ? `S3 error: ${errorText}` : "Failed to upload file to S3";
    throw new Error(message);
  }

  return {
    key,
    url: buildPublicUrl(bucket, region, key),
  };
};
