import { BaseService } from '@core/base/BaseService';
import {
  initializeTenantDatabase,
  registerTenantDatabaseAlias,
  tenantDatabaseName
} from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { Tenant } from '@modules/tenants/tenant.types';
import { ApiError } from '@utils/ApiError';
import { Types } from 'mongoose';

type CreateTenantInput = Pick<Tenant, 'name' | 'slug'> &
  Partial<Pick<Tenant, 'status' | 'subscriptionPlan' | 'settings' | 'branding' | 'featureFlags'>>;

type UpdateTenantInput = Partial<CreateTenantInput>;

export class TenantService extends BaseService {
  constructor(private readonly tenantRepository = new TenantRepository()) {
    super();
  }

  async listTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find({ isDeleted: { $ne: true } });
  }

  async getTenant(tenantIdentifier: string): Promise<Tenant> {
    const tenant = await this.findTenant(tenantIdentifier);

    if (!tenant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found');
    }

    return tenant;
  }

  async createTenant(payload: CreateTenantInput): Promise<Tenant> {
    const slug = this.normalizeSlug(payload.slug);

    if (await this.tenantRepository.findOne({ slug, isDeleted: { $ne: true } })) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Tenant already exists');
    }

    const tenantObjectId = new Types.ObjectId();
    const tenantId = String(tenantObjectId);
    registerTenantDatabaseAlias(tenantId, slug);

    const tenant = await this.tenantRepository.create({
      ...payload,
      _id: tenantObjectId as never,
      tenantId,
      slug,
      databaseName: tenantDatabaseName(slug),
      status: payload.status ?? 'trial',
      featureFlags: payload.featureFlags ?? []
    });

    await initializeTenantDatabase(slug);
    return tenant;
  }

  async updateTenant(tenantIdentifier: string, payload: UpdateTenantInput): Promise<Tenant> {
    const currentTenant = await this.findTenant(tenantIdentifier);
    const currentSlug = currentTenant.slug;
    const nextSlug = payload.slug ? this.normalizeSlug(payload.slug) : undefined;

    if (nextSlug && nextSlug !== currentSlug) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Tenant slug cannot be changed after database creation'
      );
    }

    const tenant = await this.tenantRepository.update(
      { _id: currentTenant._id, isDeleted: { $ne: true } },
      {
        ...payload,
        ...(nextSlug ? { slug: nextSlug } : {})
      }
    );

    if (!tenant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found');
    }

    return tenant;
  }

  async deleteTenant(tenantIdentifier: string): Promise<{ tenantId: string; slug: string }> {
    const currentTenant = await this.findTenant(tenantIdentifier);
    const tenant = await this.tenantRepository.update(
      { _id: currentTenant._id, isDeleted: { $ne: true } },
      { isDeleted: true }
    );

    if (!tenant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found');
    }

    return { tenantId: tenant.tenantId ?? String(tenant._id), slug: tenant.slug };
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private async findTenant(identifier: string): Promise<Tenant> {
    const value = identifier.trim();
    const slug = this.normalizeSlug(value);
    const tenant = await this.tenantRepository.findOne({
      isDeleted: { $ne: true },
      $or: [
        { tenantId: value },
        { slug },
        ...(Types.ObjectId.isValid(value) ? [{ _id: value }] : [])
      ]
    });

    if (!tenant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found');
    }

    return tenant;
  }
}
