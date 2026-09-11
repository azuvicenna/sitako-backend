import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, R2_BUCKET } from "@/config/r2";

export async function uploadFile(
  folderName: string,
  file: { buffer: Buffer; mimetype: string },
  fileName: string,
) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: `${folderName}/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  const publicUrl = process.env.PUBLIC_STORAGE_URL || "https://<public-domain>";
  return `${publicUrl}/${folderName}/${fileName}`;
}

export async function deleteFile(fileKey: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
  });

  await s3Client.send(command);
}
