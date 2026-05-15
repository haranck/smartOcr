import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AadhaarModule } from './modules/aadhaar/aadhaar.module';

@Module({
  imports: [AadhaarModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
