import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/Category.service';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = Array.isArray(req.params.categoryId) ? req.params.categoryId[0] : req.params.categoryId;
    const category = await categoryService.getCategoryById(categoryId);
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};
