import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { promisify } from 'util';

const PORT = process.env.PORT || 3001;
const PROTO_PATH = join(__dirname, 'products.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const ProductsService = protoDescriptor.products.ProductsService;

// Create a client with promisified methods
const client = new ProductsService(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);

// Promisify all client methods
const create = promisify(client.Create).bind(client);
const findAll = promisify(client.FindAll).bind(client);
const findOne = promisify(client.FindOne).bind(client);
const update = promisify(client.Update).bind(client);
const remove = promisify(client.Remove).bind(client);

async function testProductService() {
  try {
    console.log('Testing gRPC Products Service...\n');

    // Test Create
    const newProduct = {
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      quantity: 10,
    };
    
    console.log('Creating product...');
    const createdProduct = await create(newProduct);
    console.log('Created product:', createdProduct);

    // Test FindAll
    console.log('\nFetching all products...');
    const allProducts = await findAll({});
    console.log('All products:', allProducts);

    if (allProducts.products && allProducts.products.length > 0) {
      const productId = allProducts.products[0].id;

      // Test FindOne
      console.log('\nFetching single product...');
      const singleProduct = await findOne({ id: productId });
      console.log('Found product:', singleProduct);

      // Test Update
      console.log('\nUpdating product...');
      const updateData = {
        id: productId,
        name: 'Updated Product',
        description: 'Updated description',
        price: 199.99,
        quantity: 20,
      };
      const updatedProduct = await update(updateData);
      console.log('Updated product:', updatedProduct);

      // Test Remove
      console.log('\nRemoving product...');
      await remove({ id: productId });
      console.log('Product removed successfully');
    }

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the tests
console.log(`Connecting to gRPC server on port ${PORT}...`);
testProductService().catch(console.error);
