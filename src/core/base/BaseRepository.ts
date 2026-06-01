import { Model } from 'mongoose';

export abstract class BaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  async find(filter: Record<string, unknown> = {}): Promise<TDocument[]> {
    return this.model.find(filter).lean<TDocument[]>().exec();
  }

  async findOne(filter: Record<string, unknown>): Promise<TDocument | null> {
    return this.model.findOne(filter).lean<TDocument | null>().exec();
  }

  async create(payload: Partial<TDocument>): Promise<TDocument> {
    const document = await this.model.create(payload);
    return document.toObject() as TDocument;
  }

  async updateOne(filter: Record<string, unknown>, payload: Record<string, unknown>): Promise<void> {
    await this.model.updateOne(filter, payload).exec();
  }
}
