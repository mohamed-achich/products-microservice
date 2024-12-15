import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';


interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  isActive: boolean;
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
    return { products };
  } 
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: string,  data: CreateProductRequest): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return updatedProduct;
  }

  async updateStock(id: string, quantityChange: number): Promise<Product> {
    const product = await this.findOne(id);
    const newStock = product.quantity + quantityChange;
    
    if (newStock < 0) {
      throw new Error(`Cannot reduce stock below 0 for product ${id}`);
    }

    return this.productModel.findByIdAndUpdate(
      id,
      { $inc: { quantity: quantityChange } },
      { new: true }
    ).exec();
  }

  async remove(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return deletedProduct;
  }
}
