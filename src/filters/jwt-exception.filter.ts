import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

@Catch(TokenExpiredError, JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: TokenExpiredError | JsonWebTokenError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (!response.headersSent) {
      if (exception instanceof TokenExpiredError) {
        response.status(400).json({
          statusCode: 400,
          message: 'Join key has expired!',
        });
        return;
      }

      if (exception instanceof JsonWebTokenError) {
        response.status(400).json({
          statusCode: 400,
          message: 'Invalid join key!',
        });
        return;
      }
    }

  }
}
