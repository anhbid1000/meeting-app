import { CategoryDAO } from '../dao/CategoryDAO';
import Category, { DEFAULT_CATEGORIES } from '../models/Category.model';
import { AppError } from '../utils/AppError';

const categoryDAO = new CategoryDAO();

export const getAllCategories = async () => {
  let categories = await categoryDAO.listAll();

  if (categories.length === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES, { ordered: false });
    categories = await categoryDAO.listAll();
  }

  return categories;
};

export const getCategoryById = async (categoryId: string) => {
  const category = await categoryDAO.findById(categoryId);
  if (!category) {
    throw new AppError('Category không tồn tại', 404, 'CATEGORY_NOT_FOUND');
  }
  return category;
};
