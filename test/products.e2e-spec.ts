import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../src/products.module';
import { Observable, firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { Product } from '../src/schemas/product.schema';
import { getModelToken } from '@nestjs/mongoose';

interface ProductsService {
  findAll: ({}) => Observable<any>;
  findOne: (data: { id: string }) => Observable<any>;
  create: (data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    isActive: boolean;
  }) => Observable<any>;
  update: (data: {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    isActive: boolean;
  }) => Observable<any>;
  remove: (data: { id: string }) => Observable<any>;
}

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let client: ClientGrpc;
  let productsService: ProductsService;
  let productModel: Model<Product>;
  let createdProductId: string;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ProductsModule,
          ClientsModule.register([
            {
              name: 'PRODUCT_PACKAGE',
              transport: Transport.GRPC,
              options: {
                url: 'localhost:5000',
                package: 'products',
                protoPath: join(__dirname, '../src/products.proto'),
              },
            },
          ]),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.connectMicroservice({
        transport: Transport.GRPC,
        options: {
          url: 'localhost:5000',
          package: 'products',
          protoPath: join(__dirname, '../src/products.proto'),
        },
      });

      await app.startAllMicroservices();
      await app.init();

      client = app.get('PRODUCT_PACKAGE');
      productsService = client.getService<ProductsService>('ProductsService');
      productModel = moduleFixture.get<Model<Product>>(getModelToken(Product.name));

      // Verify MongoDB connection by attempting a simple operation
      await productModel.findOne();  // This will throw if connection fails
    } catch (error) {
      console.error('Failed to setup test environment:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await productModel.deleteMany({});
    } catch (error) {
      console.error('Failed to clean up test data:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (error) {
      console.error('Failed to close application:', error);
      throw error;
    }
  });

  it('should create a product', async () => {
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      quantity: 10,
      category: 'Electronics',
      isActive: true,
    };

    const product = await firstValueFrom(productsService.create(createProductDto));
    createdProductId = product.id;

    expect(product).toBeDefined();
    expect(product.name).toBe(createProductDto.name);
    expect(product.price).toBe(createProductDto.price);
    expect(product.quantity).toBe(createProductDto.quantity);
    expect(product.category).toBe(createProductDto.category);
    expect(product.isActive).toBe(createProductDto.isActive);
  });

  it('should find all products', async () => {
    // Create a test product first
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      quantity: 10,
      category: 'Electronics',
      isActive: true,
    };
    await firstValueFrom(productsService.create(createProductDto));

    const response = await firstValueFrom(productsService.findAll({}));

    expect(response.products).toBeDefined();
    expect(Array.isArray(response.products)).toBeTruthy();
    expect(response.products.length).toBe(1);
  });

  it('should find one product by id', async () => {
    // Create a test product first
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      quantity: 10,
      category: 'Electronics',
      isActive: true,
    };
    const created = await firstValueFrom(productsService.create(createProductDto));

    const product = await firstValueFrom(
      productsService.findOne({ id: created.id })
    );

    expect(product).toBeDefined();
    expect(product.id).toBe(created.id);
    expect(product.name).toBe(createProductDto.name);
  });

  it('should update a product', async () => {
    // Create a test product first
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      quantity: 10,
      category: 'Electronics',
      isActive: true,
    };
    const created = await firstValueFrom(productsService.create(createProductDto));

    const updateProductDto = {
      id: created.id,
      name: 'Updated Test Product',
      description: 'Updated Test Description',
      price: 199.99,
      quantity: 20,
      category: 'Updated Electronics',
      isActive: false,
    };

    const product = await firstValueFrom(productsService.update(updateProductDto));

    expect(product).toBeDefined();
    expect(product.name).toBe(updateProductDto.name);
    expect(product.price).toBe(updateProductDto.price);
    expect(product.quantity).toBe(updateProductDto.quantity);
    expect(product.category).toBe(updateProductDto.category);
    expect(product.isActive).toBe(updateProductDto.isActive);
  });

  it('should remove a product', async () => {
    // Create a test product first
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      quantity: 10,
      category: 'Electronics',
      isActive: true,
    };
    const created = await firstValueFrom(productsService.create(createProductDto));

    await firstValueFrom(productsService.remove({ id: created.id }));

    // Verify product is removed{}
    const allProducts = await firstValueFrom(productsService.findAll({}));
    expect(allProducts).toStrictEqual({});
  });
});