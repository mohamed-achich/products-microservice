import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductReservationHandler } from './saga/product-reservation.handler';
import { ProductSeeder } from './seeds/product.seed';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/productdb'),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'products_exchange',
          type: 'topic',
        },
      ],
      uri: `amqp://${process.env.RABBITMQ_HOST || 'localhost'}:5672`,
      connectionInitOptions: { wait: false },
      enableControllerDiscovery: true,
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductReservationHandler, ProductSeeder],
})
export class ProductsModule {}
