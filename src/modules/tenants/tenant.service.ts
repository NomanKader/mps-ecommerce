import { BaseService } from '@core/base/BaseService';
import { HTTP_STATUS } from '@core/response/http-status';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { Tenant } from '@modules/tenants/tenant.types';
import { ApiError } from '@utils/ApiError';

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

  async getTenant(tenantSlug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ slug: this.normalizeSlug(tenantSlug), isDeleted: { $ne: true } });

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

    return this.tenantRepository.create({
      ...payload,
      slug,
      status: payload.status ?? 'trial',
      featureFlags: payload.featureFlags ?? []
    });
  }

  async updateTenant(tenantSlug: string, payload: UpdateTenantInput): Promise<Tenant> {
    const currentSlug = this.normalizeSlug(tenantSlug);
    const nextSlug = payload.slug ? this.normalizeSlug(payload.slug) : undefined;

    if (nextSlug && nextSlug !== currentSlug) {
      const existingTenant = await this.tenantRepository.findOne({ slug: nextSlug, isDeleted: { $ne: true } });

      if (existingTenant) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Tenant already exists');
      }
    }

    const tenant = await this.tenantRepository.update(
      { slug: currentSlug, isDeleted: { $ne: true } },
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

  async deleteTenant(tenantSlug: string): Promise<{ slug: string }> {
    const slug = this.normalizeSlug(tenantSlug);
    const tenant = await this.tenantRepository.update({ slug, isDeleted: { $ne: true } }, { isDeleted: true });

    if (!tenant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found');
    }

    return { slug };
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }
}
