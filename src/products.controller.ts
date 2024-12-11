import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';

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
    return { products : products.products };
  }

  @GrpcMethod('ProductsService', 'FindOne')
  findOne({ id }: { id: string }) {
    return this.productsService.findOne(id);
  }

  @GrpcMethod('ProductsService', 'Create')
  create(data: CreateProductRequest) {
    return this.productsService.create(data);
  }

  @GrpcMethod('ProductsService', 'Update')
  update(data: UpdateProductRequest) {
    return this.productsService.update(data.id, data);
  }

  @GrpcMethod('ProductsService', 'Remove')
  remove({ id }: { id: string }) {
    return this.productsService.remove(id);
  }
}
