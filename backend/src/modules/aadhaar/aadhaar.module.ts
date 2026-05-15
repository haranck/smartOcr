import { Module } from '@nestjs/common';

import { AadhaarController } from './controller/aadhaar/aadhaar.controller';

import { AadhaarService } from './services/aadhaar/AadhaarService';

import { OcrService } from './services/ocr/ocr.service';

@Module({
  controllers: [AadhaarController],

  providers: [AadhaarService, OcrService],
})
export class AadhaarModule {}