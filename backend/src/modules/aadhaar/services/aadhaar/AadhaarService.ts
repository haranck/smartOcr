import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { AadhaarDataSchema } from "../../schemas/AadhaarSchema";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/HttpStatus";
import * as IServices from "../../interfaces/IServices";
import { OcrService } from "../ocr/ocr.service"; // Required for NestJS Dependency Injection

@Injectable()
export class AadhaarService implements IServices.IAadhaarService {
    constructor(private readonly ocr: OcrService) { } // Must use Class type, not Interface type

    async processAadhaar(frontPath: string, backPath: string) {
        try {
            // 1. Process Front Side
            console.log("Processing Front Image...");
            const frontText = await this.ocr.processImage(frontPath);
            const frontData = this.ocr.parseData(frontText);
            console.log("Front Aadhaar:", frontData.aadhaarNumber);

            // KEYWORD CHECK: Does this even look like an Aadhaar document?
            const aadhaarKeywords = ['aadhaar', 'unique', 'government', 'india', 'identification'];
            const lowerFrontText = frontText.toLowerCase();
            const hasFrontKeywords = aadhaarKeywords.some(k => lowerFrontText.includes(k));

            if (frontData.aadhaarNumber === 'Unknown' && !hasFrontKeywords) {
                throw new AppError(ErrorMessages.INVALID_FRONT_IMAGE, HttpStatus.BAD_REQUEST);
            }

            // Validation: Front side should have at least Name or DOB
            if (frontData.name === 'Unknown' && frontData.dob === 'Unknown') {
                if (frontData.address !== 'Unknown') {
                    throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_FRONT, HttpStatus.BAD_REQUEST);
                }
                throw new AppError(ErrorMessages.FRONT_DATA_NOT_FOUND, HttpStatus.BAD_REQUEST);
            }

            // 2. Process Back Side
            console.log("Processing Back Image...");
            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);
            console.log("Back Aadhaar:", backData.aadhaarNumber);

            const lowerBackText = backText.toLowerCase();
            const hasBackKeywords = aadhaarKeywords.some(k => lowerBackText.includes(k));

            if (backData.aadhaarNumber === 'Unknown' && !hasBackKeywords && backData.pincode === 'Unknown') {
                throw new AppError(ErrorMessages.INVALID_BACK_IMAGE, HttpStatus.BAD_REQUEST);
            }

            // DUPLICATE IMAGE CHECK: Ensure the user didn't upload the exact same side twice
            if (frontText.trim() === backText.trim()) {
                throw new AppError(ErrorMessages.DUPLICATE_IMAGES, HttpStatus.BAD_REQUEST);
            }

            // Validation: Back side should have a valid Address or Pincode
            const isAddressInvalid = !backData.address || backData.address === 'Unknown' || backData.address.length < 10;
            const isPincodeInvalid = !backData.pincode || backData.pincode === 'Unknown';

            // ANTI-DUPLICATE CHECK: If the back side has a name, it's likely the front side again!
            if (backData.name !== 'Unknown' && (isAddressInvalid && isPincodeInvalid)) {
                throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_BACK, HttpStatus.BAD_REQUEST);
            }

            if (isAddressInvalid && isPincodeInvalid) {
                throw new AppError(ErrorMessages.BACK_SIDE_NOT_RECOGNIZED, HttpStatus.BAD_REQUEST);
            }

            // AADHAAR NUMBER MATCH CHECK: Ensure front and back belong to the same person
            const frontClean = frontData.aadhaarNumber.replace(/\D/g, '');
            const backClean = backData.aadhaarNumber.replace(/\D/g, '');

            // Robust matching: Check if front number matches any of the potential numbers on the back
            // This is "doing correctly" by being smart about OCR errors
            const isFuzzyMatch = (s1: string, s2: string) => {
                if (s1 === s2) return true;
                if (s1.length !== 12 || s2.length !== 12) return false;
                
                // Case 1: 11 out of 12 digits match (single digit misread)
                let diffs = 0;
                for (let i = 0; i < 12; i++) {
                    if (s1[i] !== s2[i]) diffs++;
                }
                if (diffs <= 1) return true;

                // Case 2: Last 8 digits match perfectly (common when first 4 are misread as '1947')
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
                console.log("Mismatch Debug:", { frontClean, backMatches: backData.allAadhaarNumbers });
                throw new AppError(ErrorMessages.AADHAAR_NUMBER_MISMATCH, HttpStatus.BAD_REQUEST);
            }

            const finalData = { ...frontData };

            // Prefer address and pincode from the back side
            if (backData.address !== 'Unknown') finalData.address = backData.address;
            if (backData.pincode !== 'Unknown') finalData.pincode = backData.pincode;

            // Fallback for Aadhaar number if missing on front but present on back
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
