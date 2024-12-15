import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { ServiceAuthGuard } from './security/guards/service.guard';
import { AuthInterceptor } from './security/interceptors/auth.interceptor';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  isActive: boolean;
}

interface ProductById {
  id: string;
}

interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  isActive: boolean;
}

interface UpdateProductRequest extends Product {}

@Controller()
@UseGuards(ServiceAuthGuard)
@UseInterceptors(AuthInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public endpoints - no auth required
  @GrpcMethod('ProductsService', 'FindAll')
  async findAll() {
    const products = await this.productsService.findAll();
    return { products : products.products };
  }

  @GrpcMethod('ProductsService', 'FindOne')
  async findOne({ id }: { id: string }) {
    return this.productsService.findOne(id);
  }

  // Protected endpoints - require authentication
  @UseGuards(ServiceAuthGuard)
  @GrpcMethod('ProductsService', 'Create')
  async create(data: CreateProductRequest) {
    return this.productsService.create(data);
  }

  @UseGuards(ServiceAuthGuard)
  @GrpcMethod('ProductsService', 'Update')
  async update(data: UpdateProductRequest) {
    return this.productsService.update(data.id, data);
  }

  @UseGuards(ServiceAuthGuard)
  @GrpcMethod('ProductsService', 'Remove')
  async remove({ id }: { id: string }) {
    return this.productsService.remove(id);
  }
}
