import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface ProductById {
  id: string;
}

interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface UpdateProductRequest extends Product {}

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @GrpcMethod('ProductsService', 'FindAll')
  async findAll() {
    const products = await this.productsService.findAll();
    return { products: products.products };
  }

  @GrpcMethod('ProductsService', 'FindOne')
  async findOne(
    data: ProductById,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ) {
    return this.productsService.findOne(data.id);
  }

  @GrpcMethod('ProductsService', 'Create')
  async create(
    data: CreateProductRequest,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ) {
    return this.productsService.create(data);
  }

  @GrpcMethod('ProductsService', 'Update')
  update(
    data: UpdateProductRequest,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ) {
    return this.productsService.update(data.id, data);
  }

  @GrpcMethod('ProductsService', 'Remove')
  remove(
    data: ProductById,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ) {
    this.productsService.remove(data.id);
    return {};
  }
}
