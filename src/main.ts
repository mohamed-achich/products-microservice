import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create the main gRPC application
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(ProductsModule, {
    transport: Transport.GRPC,
    options: {
      package: 'products',
      protoPath: join(__dirname, './products.proto'),
      url: '0.0.0.0:5000'
    },
  });

  // Create a separate HTTP application just for health checks
  const httpApp = await NestFactory.create(ProductsModule);
  await httpApp.listen(5050);

  // Start the gRPC service
  await grpcApp.listen();
  
  console.log('Products microservice is listening via gRPC on port 5000');
  console.log('Health check endpoint available on port 5050');
}
bootstrap();
