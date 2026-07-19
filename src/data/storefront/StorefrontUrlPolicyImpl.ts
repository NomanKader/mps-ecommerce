import type { StorefrontUrlPolicy } from '../../domain/storefront/StorefrontUrlPolicy';

export class StorefrontUrlPolicyImpl implements StorefrontUrlPolicy {
  canOpenInsideApp(url: string): boolean {
    const parsedUrl = this.parseUrl(url);

    if (!parsedUrl) {
      return false;
    }

    return ['http:', 'https:'].includes(parsedUrl.protocol);
  }

  canOpenExternally(url: string): boolean {
    const parsedUrl = this.parseUrl(url);

    if (!parsedUrl) {
      return false;
    }

    return ['tel:', 'mailto:', 'sms:', 'viber:', 'fb:', 'messenger:'].includes(
      parsedUrl.protocol,
    );
  }

  private parseUrl(url: string): URL | null {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }
}
