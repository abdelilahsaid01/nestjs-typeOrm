import {
  NestInterceptor,
  ExecutionContext,
  Injectable,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.logger.log(
          `${method} ${url} ${Date.now() - now}ms`,
          context.getClass().name,
        ),
      ),
      catchError((error) => {
        // Log the error and re-throw it to propagate it to the global error handler
        this.logger.error(
          `Error in ${method} ${url}: ${error.message}`,
          error.stack,
          context.getClass().name,
        );
        return throwError(() => error);
      }),
    );
  }
}
