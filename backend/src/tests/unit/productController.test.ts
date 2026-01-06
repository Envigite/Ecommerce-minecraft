import { listProducts, createProduct, getProductById, updateProduct, deleteProduct } from '../../controllers/productController';
import { ProductModel } from '../../models/productModel';
import { logAction } from '../../utils/auditLogger';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../models/productModel');
jest.mock('../../utils/auditLogger');

describe('Product Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { 
      body: {}, 
      params: {}, 
      user: { id: 'admin_1', role: 'admin' }
    } as any;
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  //-----* TEST LIST & GET *-----//

  test('listProducts: Debería devolver todos los productos (200)', async () => {
    const mockProducts = [{ id: 1, name: 'Polera' }];
    (ProductModel.listProductsModel as jest.Mock).mockResolvedValue(mockProducts);

    await listProducts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  test('getProductById: Debería devolver 404 si no existe', async () => {
    req.params = { id: '999' };
    (ProductModel.getProductByIdModel as jest.Mock).mockResolvedValue(null);

    await getProductById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  //-----* TEST CREATE *-----//

  test('createProduct: Debería fallar (400) si los datos son inválidos (Zod)', async () => {
    req.body = { name: '' }; 

    await createProduct(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(ProductModel.createProductModel).not.toHaveBeenCalled();
  });

  test('createProduct: Debería crear producto y LOGGEAR la acción', async () => {
    req.body = { 
      name: 'Polera Minecraft', 
      price: 15000, 
      description: 'Polera verde', 
      stock: 10,
      category_id: 1 
    };

    const mockNewProduct = { ...req.body, id: 'prod_123' };
    (ProductModel.createProductModel as jest.Mock).mockResolvedValue(mockNewProduct);

    await createProduct(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    
    expect(logAction).toHaveBeenCalledWith(
      'admin_1', 
      "ACTIONS.CREATE_PRODUCT", 
      "product", 
      'prod_123', 
      expect.any(Object)
    );
  });

  //-----* TEST UPDATE *-----//

  test('updateProduct: Debería calcular cambios (DIFF) y loguearlos', async () => {
    req.params = { id: 'prod_1' };
    req.body = { price: 2000 };

    (ProductModel.getProductByIdModel as jest.Mock).mockResolvedValue({
      id: 'prod_1',
      name: 'Polera',
      price: 1000
    });

    (ProductModel.updateProductModel as jest.Mock).mockResolvedValue(true);

    await updateProduct(req as Request, res as Response, next);

    expect(logAction).toHaveBeenCalledWith(
      'admin_1',
      "UPDATE_PRODUCT",
      "product",
      'prod_1',
      expect.objectContaining({
        price: { from: 1000, to: 2000 }
      })
    );
    
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updateProduct: NO debería loguear si no hubo cambios reales', async () => {
    req.params = { id: 'prod_1' };
    req.body = { price: 1000 };

    (ProductModel.getProductByIdModel as jest.Mock).mockResolvedValue({
      id: 'prod_1',
      price: 1000,
      stock: 0
    });
    (ProductModel.updateProductModel as jest.Mock).mockResolvedValue(true);

    await updateProduct(req as Request, res as Response, next);

    expect(logAction).not.toHaveBeenCalled();     
    expect(res.status).toHaveBeenCalledWith(200);
  });
  
  //-----* TEST DELETE *-----//

  test('deleteProduct: Debería eliminar y registrar log', async () => {
    req.params = { id: 'prod_borrar' };
    (ProductModel.deleteProductModel as jest.Mock).mockResolvedValue(true);

    await deleteProduct(req as Request, res as Response, next);

    expect(ProductModel.deleteProductModel).toHaveBeenCalledWith('prod_borrar');
    expect(logAction).toHaveBeenCalledWith(
        'admin_1', 
        "ACTIONS.DELETE_PRODUCT", 
        "product", 
        'prod_borrar'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

});