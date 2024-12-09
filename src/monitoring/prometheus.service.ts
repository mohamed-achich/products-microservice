import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly registry: Registry;
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDuration: Histogram;

  constructor() {
    this.registry = new Registry();

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.registry.registerMetric(this.httpRequestsTotal);
    this.registry.registerMetric(this.httpRequestDuration);
  }

  recordHttpRequest(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal.labels(method, route, statusCode.toString()).inc();
  }

  startTimer(method: string, route: string) {
    return this.httpRequestDuration.labels(method, route).startTimer();
  }

  async checkMetrics() {
    const metrics = await this.registry.getMetricsAsJSON();
    return {
      status: 'up',
      metrics: metrics,
    };
  }
}
