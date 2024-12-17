import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-auth-token'];
    if (token === process.env.AUTH_INVOICE_CODE) {
      return true;
    }

    throw new UnauthorizedException('Invalid authorization token');
  }
}
