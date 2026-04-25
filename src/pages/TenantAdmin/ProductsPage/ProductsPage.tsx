import { useProducts } from '@features/product/hooks/useProducts';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { ProductGrid } from '@widgets/ProductGrid/ProductGrid';

export const ProductsPage = () => {
  const { data = [] } = useProducts();

  return (
    <PageSection
      description="Tenant-side product management can evolve from these reusable domain and feature modules."
      title="Products"
    >
      <ProductGrid products={data} />
    </PageSection>
  );
};
