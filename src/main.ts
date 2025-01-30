import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { RefreshGuard } from 'src/modules/auth/refresh-guard';
import { AuthService } from './modules/auth/auth.service';
import * as bodyParser from 'body-parser';
const allowedOrigins = [
  'http://localhost:3000',
  'https://app.watpay.io',
  'https://app.thirteenx.ai',
  'https://api.thirteenx.ai',
];

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Request from this origin is not supported.'));
      }
    },
    credentials: true,
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.useGlobalGuards(new RefreshGuard(app.get(AuthService)));
  await app.listen(5001);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
