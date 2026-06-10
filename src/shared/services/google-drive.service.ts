import { Readable } from 'node:stream';

import { env } from '@config/env';
import type { drive_v3 } from 'googleapis';

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

const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const sanitizeFilename = (filename: string): string =>
  filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export class GoogleDriveService {
  private driveClient?: drive_v3.Drive;

  async uploadProductImage(file: ProductImageFile, tenantId: string, sku: string): Promise<ProductImageMetadata> {
    const drive = await this.drive();
    const imageName = this.productImageName(file.originalname, tenantId, sku);

    const response = await drive.files.create({
      requestBody: {
        name: imageName,
        parents: [env.GOOGLE_DRIVE_PRODUCT_IMAGES_FOLDER_ID],
        appProperties: {
          tenantId,
          sku
        }
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer)
      },
      fields: 'id,name,mimeType,size'
    });

    if (!response.data.id) {
      throw new Error('Google Drive did not return a file id');
    }

    return {
      imageName,
      imageMimeType: file.mimetype,
      imageSize: file.size,
      imageDriveFileId: response.data.id
    };
  }

  async uploadStorefrontImage(file: ProductImageFile, tenantId: string, reference: string): Promise<StorefrontImageMetadata> {
    const drive = await this.drive();
    const imageName = this.storefrontImageName(file.originalname, tenantId, reference);

    const response = await drive.files.create({
      requestBody: {
        name: imageName,
        parents: [env.GOOGLE_DRIVE_PRODUCT_IMAGES_FOLDER_ID],
        appProperties: {
          tenantId,
          reference,
          purpose: 'storefront'
        }
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer)
      },
      fields: 'id,name,mimeType,size'
    });

    if (!response.data.id) {
      throw new Error('Google Drive did not return a file id');
    }

    return {
      imageName,
      imageMimeType: file.mimetype,
      imageSize: file.size,
      imageDriveFileId: response.data.id
    };
  }

  async getProductImageUrl(imageDriveFileId?: string, imageName?: string): Promise<string | null> {
    if (!imageDriveFileId || !imageName) return null;

    try {
      const drive = await this.drive();
      const response = await drive.files.get({
        fileId: imageDriveFileId,
        fields: 'id,name,trashed'
      });

      if (response.data.trashed || response.data.name !== imageName) return null;

      return `https://drive.google.com/uc?id=${encodeURIComponent(imageDriveFileId)}`;
    } catch {
      return null;
    }
  }

  async deleteProductImage(imageDriveFileId?: string): Promise<void> {
    if (!imageDriveFileId) return;

    try {
      const drive = await this.drive();
      await drive.files.delete({ fileId: imageDriveFileId });
    } catch {
      // Image cleanup should not fail the product mutation.
    }
  }

  private async drive(): Promise<drive_v3.Drive> {
    if (this.driveClient) return this.driveClient;

    const { google } = await import('googleapis');
    const auth = env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      ? new google.auth.JWT({
          email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          scopes: DRIVE_SCOPES
        })
      : new google.auth.GoogleAuth({ scopes: DRIVE_SCOPES });

    this.driveClient = google.drive({ version: 'v3', auth });
    return this.driveClient;
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
