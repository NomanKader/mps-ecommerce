import { FavoriteService } from '@modules/favorites/favorite.service';

const mockedProductModel = { findOne: jest.fn() };
const mockedRepository = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), deleteOne: jest.fn() };
jest.mock('@core/database/tenant-database', () => ({ getTenantModels: jest.fn(() => ({ ProductModel: mockedProductModel })) }));
jest.mock('@modules/favorites/favorite.repository', () => ({ FavoriteRepository: jest.fn().mockImplementation(() => mockedRepository) }));

const productId = '507f1f77bcf86cd799439011';
describe('FavoriteService', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(['home-offer-2', 'vegetables-showcase-1', 'undefined', 'invalid', ''])('returns not found for unavailable product id %s before querying MongoDB', async (id) => {
    await expect(new FavoriteService().toggleFavorite('av', 'user-1', id)).rejects.toMatchObject({ statusCode: 404 });
    expect(mockedProductModel.findOne).not.toHaveBeenCalled();
  });

  it('rejects missing authentication', async () => {
    await expect(new FavoriteService().toggleFavorite('av', undefined, productId)).rejects.toMatchObject({ statusCode: 401 });
    expect(mockedProductModel.findOne).not.toHaveBeenCalled();
  });

  it('returns not found for a deleted or unavailable database product', async () => {
    mockedProductModel.findOne.mockReturnValue({ select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) }) });
    await expect(new FavoriteService().toggleFavorite('av', 'user-1', productId)).rejects.toMatchObject({ statusCode: 404 });
    expect(mockedRepository.create).not.toHaveBeenCalled();
  });

  it.each([false, true])('toggles an existing database product when already saved = %s', async (alreadySaved) => {
    mockedProductModel.findOne.mockReturnValue({ select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue({ _id: productId }) }) }) });
    mockedRepository.findOne.mockResolvedValue(alreadySaved ? { productId } : null);
    mockedRepository.find.mockResolvedValue(alreadySaved ? [] : [{ productId }]);
    const result = await new FavoriteService().toggleFavorite('av', 'user-1', productId);
    expect(result).toEqual({ isFavorite: !alreadySaved, productId, productIds: alreadySaved ? [] : [productId] });
    expect(mockedProductModel.findOne).toHaveBeenCalledWith(expect.objectContaining({ _id: productId, tenantId: 'av', status: 'active', isDeleted: { $ne: true } }));
    expect(alreadySaved ? mockedRepository.deleteOne : mockedRepository.create).toHaveBeenCalledWith({ tenantId: 'av', userId: 'user-1', productId });
  });
});
