import { Router } from 'express';
import * as categoryController from '../controllers/Category.controller';

const router = Router();

// Public: Get all categories
router.get('/', categoryController.getAllCategories);

// Public: Get category by id
router.get('/:categoryId', categoryController.getCategoryById);

export default router;
