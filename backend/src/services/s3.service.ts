import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'whiteboard-storage';

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ru-central1', // Default to Yandex Cloud region usually
      endpoint: process.env.AWS_ENDPOINT || 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      // forcePathStyle: true is often needed for MinIO or self-hosted S3, usually not for AWS/Yandex, but good to have if configurable
      forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true',
    });
  }

  /**
   * Uploads a file to S3 and returns its public URL
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const fileName = `${folder}/${uniqueSuffix}${ext}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Specify ACL so images are publicly readable by default
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      // Construct public URL
      // If endpoint is https://storage.yandexcloud.net and bucket is my-bucket
      // URL: https://my-bucket.storage.yandexcloud.net/uploads/... OR https://storage.yandexcloud.net/my-bucket/uploads/...
      // Yandex mostly supports both, but virtual hosted style is preferred:
      let endpointUrl =
        process.env.AWS_ENDPOINT || 'https://storage.yandexcloud.net';
      endpointUrl = endpointUrl.endsWith('/')
        ? endpointUrl.slice(0, -1)
        : endpointUrl;

      const forcePathStyle = process.env.AWS_FORCE_PATH_STYLE === 'true';
      let publicUrl = '';
      if (forcePathStyle) {
        publicUrl = `${endpointUrl}/${this.bucketName}/${fileName}`;
      } else {
        const urlObj = new URL(endpointUrl);
        publicUrl = `${urlObj.protocol}//${this.bucketName}.${urlObj.host}/${fileName}`;
      }

      return publicUrl;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error uploading file to S3: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Unknown error uploading file to S3`, error);
      }
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }

  /**
   * Deletes a file from S3 by its public URL
   */
  async deleteFileByUrl(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      // Extract the key from the URL. This logic depends on URL format.
      // Easiest is to try parsing the URL path and removing the leading slash and bucket name if path style
      let key: string | null = null;
      try {
        const urlObj = new URL(fileUrl);
        key = urlObj.pathname.substring(1); // remove leading slash

        // If force path style, the first path segment is the bucket name, so we must remove it too
        if (
          process.env.AWS_FORCE_PATH_STYLE === 'true' &&
          key.startsWith(this.bucketName + '/')
        ) {
          key = key.substring(this.bucketName.length + 1);
        }
      } catch {
        this.logger.warn(
          `Could not parse URL ${fileUrl} to extract S3 key for deletion`,
        );
        return;
      }

      if (!key) return;

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: decodeURIComponent(key),
      });

      await this.s3Client.send(command);
      this.logger.log(`Deleted file from S3: ${key}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error deleting file from S3: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Unknown error deleting file from S3`, error);
      }
      // We usually don't throw an error here to not break the main workflow if delete fails
    }
  }
}
