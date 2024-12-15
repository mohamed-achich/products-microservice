import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductReservationHandler } from './saga/product-reservation.handler';
import { ProductSeeder } from './seeds/product.seed';
import { SecurityModule } from './security/security.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SecurityModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'products_exchange',
            type: 'topic',
          },
        ],
        uri: configService.get<string>('RABBITMQ_URL'),
        connectionInitOptions: { wait: true },
        enableControllerDiscovery: true,
      }),
      inject: [ConfigService],
    }),
    HealthModule 
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductReservationHandler, ProductSeeder],
})
export class ProductsModule {}
