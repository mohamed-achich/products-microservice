import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';

@Injectable()
export class ProductSeeder {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async seed() {
    const products = [
      {
        name: 'Laptop XPS 15',
        price: 1499.99,
        quantity: 10,
      },
      {
        name: 'iPhone 15 Pro',
        price: 999.99,
        quantity: 20,
      },
      {
        name: 'Samsung Galaxy S24',
        price: 899.99,
        quantity: 15,
      },
    ];

    for (const product of products) {
      const existingProduct = await this.productModel.findOne({
        name: product.name,
      }).exec();

      if (!existingProduct) {
        await this.productModel.create(product);
      }
    }

    console.log('Products seeded successfully!');
  }
}
