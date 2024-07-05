import './boilerplate.polyfill';

import path from 'node:path';

import { type DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/middleware/session.middleware';
import { ReferralModule } from 'src/modules/referral/referral.module';
import { TelegramModule } from 'src/modules/telegram/telegram.module';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { UserModule } from './modules/user/user.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [],
})
export class AdditionsModule {
  static register(): DynamicModule {
    const imports: any[] = [];

    if (process.env.TELEGRAM_SERVER) {
      imports.push(
        TelegrafModule.forRootAsync({
          useFactory: () => ({
            token: process.env.BOT_TELEGRAM_TOKEN as any,
            middlewares: [sessionMiddleware],
            include: [TelegramModule],
          }),
        }),
        TelegramModule,
      );
    }

    return {
      imports,
      module: ConfigModule,
    };
  }
}

@Module({
  imports: [
    UserModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) => ({
        throttlers: [configService.throttlerConfigs],
      }),
      inject: [ApiConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      dataSourceFactory: (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return Promise.resolve(
          addTransactionalDataSource(new DataSource(options)),
        );
      },
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ApiConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: configService.isDevelopment,
        },
        resolvers: [
          { use: QueryResolver, options: ['lang'] },
          AcceptLanguageResolver,
          new HeaderResolver(['x-lang']),
        ],
      }),
      imports: [SharedModule],
      inject: [ApiConfigService],
    }),
    HealthCheckerModule,
    AdditionsModule.register(),
    ReferralModule,
  ],
  providers: [],
})
export class AppModule {}
