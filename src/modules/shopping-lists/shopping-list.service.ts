import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

export class ShoppingListService {
  private context(tenantId?: string, userId?: string) {
    if (!tenantId || !userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');
    }
    return { tenantId, userId };
  }

  async list(tenantId?: string, userId?: string) {
    const context = this.context(tenantId, userId);
    const { ShoppingListModel } = getTenantModels(context.tenantId);
    return ShoppingListModel.find(context).sort({ updatedAt: -1 }).lean();
  }

  async create(tenantId: string | undefined, userId: string | undefined, name: string) {
    const context = this.context(tenantId, userId);
    const { ShoppingListModel } = getTenantModels(context.tenantId);
    try {
      return await ShoppingListModel.create({ ...context, name, productIds: [] }).then((item) =>
        item.toObject()
      );
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 11000) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'A shopping list with this name already exists');
      }
      throw error;
    }
  }

  async rename(tenantId: string | undefined, userId: string | undefined, id: string, name: string) {
    const context = this.context(tenantId, userId);
    const { ShoppingListModel } = getTenantModels(context.tenantId);
    const list = await ShoppingListModel.findOneAndUpdate(
      { _id: id, ...context },
      { name },
      { new: true, runValidators: true }
    ).lean();
    if (!list) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Shopping list not found');
    return list;
  }

  async remove(tenantId: string | undefined, userId: string | undefined, id: string) {
    const context = this.context(tenantId, userId);
    const { ShoppingListModel } = getTenantModels(context.tenantId);
    const result = await ShoppingListModel.deleteOne({ _id: id, ...context });
    if (!result.deletedCount) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Shopping list not found');
    return { id };
  }

  async toggleProduct(
    tenantId: string | undefined,
    userId: string | undefined,
    id: string,
    productId: string
  ) {
    const context = this.context(tenantId, userId);
    const { ProductModel, ShoppingListModel } = getTenantModels(context.tenantId);
    const product = await ProductModel.exists({
      _id: productId,
      tenantId: context.tenantId,
      isDeleted: { $ne: true },
      status: 'active'
    });
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

    const list = await ShoppingListModel.findOne({ _id: id, ...context }).lean();
    if (!list) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Shopping list not found');
    const hasProduct = list.productIds.includes(productId);
    return ShoppingListModel.findOneAndUpdate(
      { _id: id, ...context },
      hasProduct ? { $pull: { productIds: productId } } : { $addToSet: { productIds: productId } },
      { new: true }
    ).lean();
  }
}
