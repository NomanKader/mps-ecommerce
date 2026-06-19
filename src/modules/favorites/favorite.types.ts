export interface Favorite {
  _id: string;
  tenantId: string;
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FavoriteListResponse = {
  productIds: string[];
};

export type FavoriteToggleResponse = {
  isFavorite: boolean;
  productId: string;
  productIds: string[];
};
