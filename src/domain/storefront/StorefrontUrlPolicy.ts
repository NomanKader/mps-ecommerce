export interface StorefrontUrlPolicy {
  canOpenInsideApp(url: string): boolean;
  canOpenExternally(url: string): boolean;
}
