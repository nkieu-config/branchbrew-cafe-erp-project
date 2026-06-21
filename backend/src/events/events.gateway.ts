import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../orders/events/order-created.event';
import { OrderStatusUpdatedEvent } from '../orders/events/order-status-updated.event';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent('order.created', { async: true })
  handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`Broadcasting new order via WS: ${event.order.id}`);
    this.server.emit('orderCreated', event.order);
  }

  @OnEvent('order.status.updated', { async: true })
  handleOrderStatusUpdated(event: OrderStatusUpdatedEvent) {
    this.logger.log(`Broadcasting status update via WS for order: ${event.orderId}`);
    this.server.emit('orderStatusUpdated', { orderId: event.orderId, status: event.status });
  }
}
