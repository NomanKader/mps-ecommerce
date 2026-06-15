import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '@config/env';

type ProductImageFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type ProductImageMetadata = {
  imageName: string;
  imageMimeType: string;
  imageSize: number;
  imageDriveFileId: string;
};

export type StorefrontImageMetadata = {
  imageName: string;
  imageMimeType: string;
  imageSize: number;
  imageDriveFileId: string;
};

const sanitizeFilename = (filename: string): string =>
  filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export class S3Service {
  private s3Client?: S3Client;

  async uploadProductImage(
    file: ProductImageFile,
    tenantId: string,
    sku: string
  ): Promise<ProductImageMetadata> {
    const imageName = this.productImageName(file.originalname, tenantId, sku);
    const imageKey = `products/${imageName}`;

    await this.client().send(
      new PutObjectCommand({
        Bucket: this.bucketName(),
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    return {
      imageName,
      imageMimeType: file.mimetype,
      imageSize: file.size,
      imageDriveFileId: imageKey
    };
  }

  async uploadStorefrontImage(
    file: ProductImageFile,
    tenantId: string,
    reference: string
  ): Promise<StorefrontImageMetadata> {
    const imageName = this.storefrontImageName(file.originalname, tenantId, reference);
    const imageKey = `storefront/${imageName}`;

    await this.client().send(
      new PutObjectCommand({
        Bucket: this.bucketName(),
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    return {
      imageName,
      imageMimeType: file.mimetype,
      imageSize: file.size,
      imageDriveFileId: imageKey
    };
  }

  async getProductImageUrl(imageKey?: string, imageName?: string): Promise<string | null> {
    if (!imageKey || !imageName || !imageKey.endsWith(imageName)) return null;

    try {
      await this.client().send(
        new HeadObjectCommand({
          Bucket: this.bucketName(),
          Key: imageKey
        })
      );

      return getSignedUrl(
        this.client(),
        new GetObjectCommand({
          Bucket: this.bucketName(),
          Key: imageKey
        }),
        { expiresIn: env.S3_SIGNED_URL_EXPIRES_IN_SECONDS }
      );
    } catch {
      return null;
    }
  }

  async deleteProductImage(imageKey?: string): Promise<void> {
    if (!imageKey) return;

    try {
      await this.client().send(
        new DeleteObjectCommand({
          Bucket: this.bucketName(),
          Key: imageKey
        })
      );
    } catch {
      // Image cleanup should not fail the product mutation.
    }
  }

  private client(): S3Client {
    if (this.s3Client) return this.s3Client;

    const accessKeyId = env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required for S3 image uploads.'
      );
    }

    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    return this.s3Client;
  }

  private bucketName(): string {
    if (!env.S3_BUCKET_NAME) throw new Error('S3_BUCKET_NAME is required for S3 image uploads.');
    return env.S3_BUCKET_NAME;
  }

  private productImageName(originalName: string, tenantId: string, sku: string): string {
    const fallbackName = 'product-image';
    const safeOriginalName = sanitizeFilename(originalName) || fallbackName;
    const safeTenant = sanitizeFilename(tenantId) || 'tenant';
    const safeSku = sanitizeFilename(sku) || 'sku';

    return `${safeTenant}-${safeSku}-${Date.now()}-${safeOriginalName}`;
  }

  private storefrontImageName(originalName: string, tenantId: string, reference: string): string {
    const fallbackName = 'storefront-image';
    const safeOriginalName = sanitizeFilename(originalName) || fallbackName;
    const safeTenant = sanitizeFilename(tenantId) || 'tenant';
    const safeReference = sanitizeFilename(reference) || 'storefront';

    return `${safeTenant}-${safeReference}-${Date.now()}-${safeOriginalName}`;
  }
}
