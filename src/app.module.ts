import { ModulesModule } from './modules/modules.module';
import { Module } from '@nestjs/common';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [InternalModule, ModulesModule],
})
export class AppModule {}
