import { Global, Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';

@Global()
@Module({
  imports: [
    EventsModule,
  ],
  exports: [
    EventsModule,
  ],
})
export class ModulesModule {}
