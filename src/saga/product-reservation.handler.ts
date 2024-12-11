import { Injectable } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ProductsService } from '../products.service';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface OrderCreatedEvent {
  orderId: string;
  items: OrderItem[];
}

interface OrderCancelledEvent {
  orderId: string;
  items: OrderItem[];
}

@Injectable()
export class ProductReservationHandler {
  constructor(
    private readonly productsService: ProductsService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @RabbitSubscribe({
    exchange: 'products_exchange',
    routingKey: 'order.created',
    queue: 'product_reservation_queue'
  })
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      // Check if all products exist and have sufficient stock
      for (const item of event.items) {
        const product = await this.productsService.findOne(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      // Reserve products by reducing stock
      for (const item of event.items) {
        await this.productsService.updateStock(
          item.productId,
          -item.quantity // Decrease stock
        );
      }

      // Publish success event
      await this.amqpConnection.publish(
        'products_exchange',
        'products.reserved',
        {
          orderId: event.orderId,
          success: true
        }
      );
    } catch (error) {
      // Publish failure event
      await this.amqpConnection.publish(
        'products_exchange',
        'products.reserved',
        {
          orderId: event.orderId,
          success: false,
          reason: error.message
        }
      );
    }
  }

  @RabbitSubscribe({
    exchange: 'products_exchange',
    routingKey: 'order.cancelled',
    queue: 'product_cancellation_queue'
  })
  async handleOrderCancelled(event: OrderCancelledEvent) {
    try {
      // Release reserved products by increasing stock
      for (const item of event.items) {
        await this.productsService.updateStock(
          item.productId,
          item.quantity // Increase stock back
        );
      }

      await this.amqpConnection.publish(
        'products_exchange',
        'products.released',
        {
          orderId: event.orderId,
          success: true
        }
      );
    } catch (error) {
      console.error('Failed to release products:', error);
      await this.amqpConnection.publish(
        'products_exchange',
        'products.released',
        {
          orderId: event.orderId,
          success: false,
          reason: error.message
        }
      );
    }
  }
}
