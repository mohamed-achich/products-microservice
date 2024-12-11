import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProductsModule, {
    transport: Transport.GRPC,
    options: {
      package: 'products',
      protoPath: join(__dirname, './products.proto'),
      url: '0.0.0.0:5000'
    },
  });

  await app.listen();
  console.log('Products microservice is listening via gRPC on port 5000');
}
bootstrap();
