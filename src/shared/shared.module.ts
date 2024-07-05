/* eslint-disable  @typescript-eslint/require-await */
import { Global, Module, type Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ApiConfigService } from './services/api-config.service';
import { AwsS3Service } from './services/aws-s3.service';
import { GeneratorService } from './services/generator.service';
import { SuiClientService } from './services/sui-client.service';
import { TranslationService } from './services/translation.service';
import { ValidatorService } from './services/validator.service';

const providers: Provider[] = [
  ApiConfigService,
  ValidatorService,
  AwsS3Service,
  GeneratorService,
  TranslationService,
  SuiClientService,
];

@Global()
@Module({
  providers,
  imports: [
    CqrsModule,
  ],
  exports: [...providers, CqrsModule],
})
export class SharedModule {}
