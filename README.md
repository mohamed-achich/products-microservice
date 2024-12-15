

# Products Microservice

A microservice responsible for managing product data in the e-commerce system. Built with NestJS and MongoDB, it provides both REST and gRPC endpoints for product management.

## Features

- Product CRUD operations
- MongoDB integration with Mongoose
- gRPC server implementation
- Service-to-service authentication
- Health checks
- Data seeding
- Event-driven updates using RabbitMQ

## Product Schema

```typescript
{
  name: string;        // Required - Product name
  description: string; // Required - Product description
  price: number;       // Required - Product price
  quantity: number;    // Required - Available quantity
  category: string;    // Optional - Product category
  isActive: boolean;   // Default: true - Product availability status
}
```

## API Endpoints (gRPC)

```protobuf
service ProductsService {
  // Public endpoints
  rpc FindAll (Empty) returns (ProductList);
  rpc FindOne (ProductById) returns (Product);
  
  // Protected endpoints - require authentication
  rpc Create (CreateProductRequest) returns (Product);
  rpc Update (UpdateProductRequest) returns (Product);
  rpc Remove (ProductById) returns (Product);
}
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```env
# Server
PORT=5000
GRPC_PORT=5050
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/products

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=products_queue

# Security
SERVICE_AUTH_TOKEN=your_service_auth_token
```

4. Run the service:
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## Docker Support

Build and run using Docker:

```bash
# Build the image
docker build -t products-service .

# Run the container
docker run -p 5000:5000 -p 5050:5050 products-service
```

Using Docker Compose:

```bash
docker-compose up
```

## Database Seeding

The service includes a seeding mechanism to populate the database with initial product data:

```bash
# Run database seeds
npm run seed
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Event-Driven Architecture

The service publishes events to RabbitMQ for the following actions:
- Product created
- Product updated
- Product deleted
- Inventory changes

These events can be consumed by other services that need to react to product changes.

## Health Checks

The service includes health check endpoints to monitor:
- Service status
- Database connection
- RabbitMQ connection

## Security

- Service-to-service authentication using tokens
- Request validation
- Error handling
- Rate limiting
- Secure configuration management

## Monitoring

The service exposes metrics for:
- Request counts and latencies
- Database operations
- Message queue status
- Error rates

## API Documentation

The gRPC service definitions can be found in `src/products.proto`. The service implements the following methods:

### FindAll
- Returns a list of all active products
- No authentication required
- Returns: ProductList

### FindOne
- Returns a single product by ID
- No authentication required
- Returns: Product
- Throws: NotFoundException if product doesn't exist

### Create
- Creates a new product
- Requires service authentication
- Input: CreateProductRequest
- Returns: Product
- Publishes: ProductCreatedEvent

### Update
- Updates an existing product
- Requires service authentication
- Input: UpdateProductRequest
- Returns: Product
- Throws: NotFoundException if product doesn't exist
- Publishes: ProductUpdatedEvent

### Remove
- Deletes a product (soft delete)
- Requires service authentication
- Input: ProductById
- Returns: Product
- Throws: NotFoundException if product doesn't exist
- Publishes: ProductDeletedEvent
