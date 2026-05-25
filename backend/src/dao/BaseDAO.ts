import type { Model, Document, UpdateQuery } from 'mongoose';

export class BaseDAO<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(doc: Partial<T>) {
    return this.model.create(doc);
  }

  async findById(id: string) {
    return this.model.findById(id).lean();
  }

  async findOne(filter: Parameters<Model<T>['findOne']>[0]) {
    return this.model.findOne(filter).lean();
  }

  async updateById(id: string, update: UpdateQuery<T>) {
    return this.model.findByIdAndUpdate(id, update, { new: true }).lean();
  }

  async deleteById(id: string) {
    return this.model.findByIdAndDelete(id).lean();
  }
}

