import { Module } from '@nestjs/common';
import { AadhaarModule } from './modules/aadhaar/aadhaar.module';

@Module({
  imports: [AadhaarModule],
})
export class AppModule { }