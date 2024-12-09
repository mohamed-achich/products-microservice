import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ServiceUnavailableException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private breaker: any;

  constructor() {
    this.breaker = new CircuitBreaker(async (context: ExecutionContext, next: CallHandler) => {
      return next.handle().toPromise();
    }, {
      timeout: 3000, // Time in milliseconds to wait for response
      errorThresholdPercentage: 50, // Error percentage at which to open circuit
      resetTimeout: 30000, // Time in milliseconds to wait before testing circuit
      rollingCountTimeout: 10000, // Sets the duration of the statistical rolling window
      rollingCountBuckets: 10, // Sets the number of buckets the rolling window is divided into
    });

    this.breaker.fallback(() => {
      throw new ServiceUnavailableException('Service is temporarily unavailable');
    });

    // Event listeners for monitoring
    this.breaker.on('open', () => {
      console.log('Circuit Breaker opened');
    });

    this.breaker.on('close', () => {
      console.log('Circuit Breaker closed');
    });

    this.breaker.on('halfOpen', () => {
      console.log('Circuit Breaker half-open');
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return new Observable(subscriber => {
      this.breaker.fire(context, next)
        .then(value => {
          subscriber.next(value);
          subscriber.complete();
        })
        .catch(err => {
          subscriber.error(err);
        });
    }).pipe(
      timeout(3000),
      catchError(err => throwError(() => err))
    );
  }
}
