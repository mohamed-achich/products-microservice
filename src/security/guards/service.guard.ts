import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Log the secret during initialization
    console.log('Service Secret:', this.configService.get<string>('JWT_SERVICE_SECRET'));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = context.getArgByIndex(1); // gRPC metadata
    const authorization = metadata.get('authorization');

    if (!authorization) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const token = authorization[0].replace('Bearer ', '');
    console.log('Received token:', token);

    try {
      const secret = this.configService.get<string>('JWT_SERVICE_SECRET');
      console.log('Using secret for verification:', secret);
      
      const payload = this.jwtService.verify(token, {
        secret: secret,
      });
      console.log('Token payload:', payload);

      if (payload.type !== 'service') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Add service info to request for later use
      context.getArgByIndex(2).service = payload.service;
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
