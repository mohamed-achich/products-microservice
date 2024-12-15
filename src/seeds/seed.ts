import { NestFactory } from '@nestjs/core';
import { ProductsModule } from '../products.module';
import { ProductSeeder } from './product.seed';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  const seeder = app.get(ProductSeeder);
  
  try {
    await seeder.seed();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
