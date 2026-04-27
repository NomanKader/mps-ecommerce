export type Category = {
  color?: string;
  icon?: string;
  id: string;
  itemCount: number;
  name: string;
  slug: string;
  subcategories?: {
    icon: string;
    id: string;
    name: string;
    slug: string;
  }[];
};
