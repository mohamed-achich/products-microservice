import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    quantity: 10,
  };

  const mockMetadata = {} as Metadata;
  const mockCall = {} as ServerUnaryCall<any, any>;

  const mockProductsService = {
    create: jest.fn().mockResolvedValue(mockProduct),
    findAll: jest.fn().mockResolvedValue([mockProduct]),
    findOne: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue(mockProduct),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: getModelToken(Product.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockProduct]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result = await controller.findOne({ id: '1' }, mockMetadata, mockCall);
      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createRequest = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        quantity: 10,
      };
      const result = await controller.create(createRequest, mockMetadata, mockCall);
      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(createRequest);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateRequest = {
        id: '1',
        name: 'Updated Product',
        description: 'Updated Description',
        price: 199.99,
        quantity: 20,
      };
      const result = await controller.update(updateRequest, mockMetadata, mockCall);
      expect(result).toEqual(mockProduct);
      expect(service.update).toHaveBeenCalledWith(updateRequest.id, updateRequest);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const result = await controller.remove({ id: '1' }, mockMetadata, mockCall);
      expect(result).toEqual({});
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});