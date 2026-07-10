export type Category = {
  color?: string;
  icon?: string;
  id: string;
  itemCount: number;
  name: string;
  slug: string;
  sortOrder?: number;
  subcategories?: {
    icon: string;
    id: string;
    name: string;
    slug: string;
  }[];
};
