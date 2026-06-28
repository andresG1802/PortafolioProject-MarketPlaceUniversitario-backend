import { Router, Response, NextFunction } from 'express';
import { PostgresProductRepository } from '../../database/repositories/PostgresProductRepository';
import { CreateProductUseCase } from '../../../application/product/CreateProduct.usecase';
import { GetProductsUseCase } from '../../../application/product/GetProducts.usecase';
import { GetProductByIdUseCase } from '../../../application/product/GetProductById.usecase';
import { UpdateProductStatusUseCase } from '../../../application/product/UpdateProductStatus.usecase';
import { DeleteProductUseCase } from '../../../application/product/DeleteProduct.usecase';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const repo = new PostgresProductRepository();

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, search, minPrice, maxPrice, status, sellerId, limit, offset } = req.query;
    const result = await new GetProductsUseCase(repo).execute({
      category: category as 'apuntes' | 'laptops' | 'accesorios' | undefined,
      search: search as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      status: status as 'disponible' | 'vendido' | 'pausado' | undefined,
      sellerId: sellerId ? Number(sellerId) : undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await new GetProductByIdUseCase(repo).execute(Number(req.params.id));
    res.json({ success: true, product });
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, upload.array('images', 5), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const images = files.map((f) => `/uploads/${f.filename}`);
    const product = await new CreateProductUseCase(repo).execute({
      ...req.body,
      price: Number(req.body.price),
      sellerId: req.userId!,
      images,
    });
    res.status(201).json({ success: true, product });
  } catch (e) { next(e); }
});

router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await new UpdateProductStatusUseCase(repo).execute({
      productId: Number(req.params.id),
      requesterId: req.userId!,
      status: req.body.status,
    });
    res.json({ success: true, product });
  } catch (e) { next(e); }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await new DeleteProductUseCase(repo).execute(Number(req.params.id), req.userId!);
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (e) { next(e); }
});

export default router;
