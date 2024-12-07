import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';

interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface ProductList {
  products: Product[];
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(data: CreateProductRequest): Promise<Product> {
    const createdProduct = new this.productModel(data);
    return createdProduct.save();
  }

  async findAll(): Promise<ProductList> {
    const products = await this.productModel.find().exec();
    return { products : products };
  }

  async findOne(id: string): Promise<Product> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, data: CreateProductRequest): Promise<Product> {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string): Promise<Product> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
