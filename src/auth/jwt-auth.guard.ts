import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // Пропускаем проверку JWT, если это запрос на init
    if (
      request.url === '/api/users/init' ||
      request.url === '/api/auth/refresh'
    ) {
      return true;
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
