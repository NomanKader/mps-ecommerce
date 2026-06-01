export class FeatureFlagService {
  isEnabled(_feature: string, _tenantId?: string): boolean {
    return false;
  }
}
