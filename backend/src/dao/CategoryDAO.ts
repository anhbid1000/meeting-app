import Category, { ICategory } from '../models/Category.model';
import { BaseDAO } from './BaseDAO';

export class CategoryDAO extends BaseDAO<ICategory> {
  constructor() {
    super(Category);
  }

  async findBySlug(slug: string) {
    return this.model.findOne({ slug }).lean();
  }

  async findByName(name: string) {
    return this.model.findOne({ name }).lean();
  }

  async listAll() {
    return this.model.find({}).sort({ name: 1 }).lean();
  }
}
