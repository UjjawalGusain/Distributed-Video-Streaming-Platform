import dotenv from "dotenv"
import path  from "path";
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

export const MONGODB_URI = getEnvVar("MONGODB_URI");
export const AWS_ACCESS_KEY = getEnvVar("AWS_ACCESS_KEY");
export const AWS_SECRET_KEY = getEnvVar("AWS_SECRET_KEY");
export const AWS_REGION = getEnvVar("AWS_REGION");
export const S3_BUCKET = getEnvVar("S3_BUCKET");
