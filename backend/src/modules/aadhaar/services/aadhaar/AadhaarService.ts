import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { AadhaarDataSchema } from "../../schemas/AadhaarSchema";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/HttpStatus";
import * as IServices from "../../interfaces/IServices";
import { OcrService } from "../ocr/ocr.service";

@Injectable()
export class AadhaarService implements IServices.IAadhaarService {
    constructor(private readonly ocr: OcrService) { }

    async processAadhaar(frontPath: string, backPath: string): Promise<IServices.AadhaarResponse> {
        try {
            const frontText = await this.ocr.processImage(frontPath);
            const frontData = this.ocr.parseData(frontText);

            const aadhaarKeywords = ['aadhaar', 'unique', 'government', 'india', 'identification'];
            const lowerFrontText = frontText.toLowerCase();
            const hasFrontKeywords = aadhaarKeywords.some(k => lowerFrontText.includes(k));

            if (frontData.aadhaarNumber === 'Unknown' && !hasFrontKeywords) {
                throw new AppError(ErrorMessages.INVALID_FRONT_IMAGE, HttpStatus.BAD_REQUEST);
            }

            if (frontData.name === 'Unknown' && frontData.dob === 'Unknown') {
                if (frontData.address !== 'Unknown') {
                    throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_FRONT, HttpStatus.BAD_REQUEST);
                }
                throw new AppError(ErrorMessages.FRONT_DATA_NOT_FOUND, HttpStatus.BAD_REQUEST);
            }

            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);

            const lowerBackText = backText.toLowerCase();
            const hasBackKeywords = aadhaarKeywords.some(k => lowerBackText.includes(k));

            if (backData.aadhaarNumber === 'Unknown' && !hasBackKeywords && backData.pincode === 'Unknown') {
                throw new AppError(ErrorMessages.INVALID_BACK_IMAGE, HttpStatus.BAD_REQUEST);
            }

            if (frontText.trim() === backText.trim()) {
                throw new AppError(ErrorMessages.DUPLICATE_IMAGES, HttpStatus.BAD_REQUEST);
            }

            const isAddressInvalid = !backData.address || backData.address === 'Unknown' || backData.address.length < 10;
            const isPincodeInvalid = !backData.pincode || backData.pincode === 'Unknown';

            if (backData.name !== 'Unknown' && (isAddressInvalid && isPincodeInvalid)) {
                throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_BACK, HttpStatus.BAD_REQUEST);
            }

            if (isAddressInvalid && isPincodeInvalid) {
                throw new AppError(ErrorMessages.BACK_SIDE_NOT_RECOGNIZED, HttpStatus.BAD_REQUEST);
            }

            const frontClean: string = frontData.aadhaarNumber.replace(/\D/g, '');
            const backClean: string = backData.aadhaarNumber.replace(/\D/g, '');

            const isFuzzyMatch = (s1: string, s2: string): boolean => {
                if (s1 === s2) return true;
                if (s1.length !== 12 || s2.length !== 12) return false;
                
                let diffs = 0;
                for (let i = 0; i < 12; i++) {
                    if (s1[i] !== s2[i]) diffs++;
                }
                if (diffs <= 1) return true;

                if (s1.substring(4) === s2.substring(4)) return true;

                return false;
            };

            const hasMatch = backData.allAadhaarNumbers?.some((num: string) => isFuzzyMatch(frontClean, num)) || 
                    isFuzzyMatch(frontClean, backClean);

            if (
                frontData.aadhaarNumber !== 'Unknown' &&
                backData.aadhaarNumber !== 'Unknown' &&
                !hasMatch
            ) {
                throw new AppError(ErrorMessages.AADHAAR_NUMBER_MISMATCH, HttpStatus.BAD_REQUEST);
            }

            const finalData: IServices.AadhaarData = { ...frontData };

            if (backData.address !== 'Unknown') finalData.address = backData.address;
            if (backData.pincode !== 'Unknown') finalData.pincode = backData.pincode;

            if (finalData.aadhaarNumber === 'Unknown' && backData.aadhaarNumber !== 'Unknown') {
                finalData.aadhaarNumber = backData.aadhaarNumber;
            }

            return {
                success: true,
                data: AadhaarDataSchema.parse(finalData),
            };
        } finally {
            [frontPath, backPath].forEach(path => {
                if (path && fs.existsSync(path)) {
                    fs.unlinkSync(path);
                }
            });
        }
    }
}
