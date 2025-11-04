import AWS from "aws-sdk";
import { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION } from "../config";


AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});

export const s3 = new AWS.S3();