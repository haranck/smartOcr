import { Injectable, HttpStatus } from "@nestjs/common";
import * as fs from "fs";
import { OcrService } from "../ocr/ocr.service";
import { ERROR_MESSAGES } from "../../constants/messages.constant";
import { AadhaarData, parseAadhaarData } from "../../schemas/aadhaar.schema";
import { AppError } from "../../utils/app-error.util";

@Injectable()
export class AadhaarService {
    constructor(private readonly ocr: OcrService) { }

    async processAadhaar(frontPath: string, backPath: string) {
        try {
            // 1. Process Front Side
            const frontText = await this.ocr.processImage(frontPath);
            const frontData = this.ocr.parseData(frontText);

            // KEYWORD CHECK
            const aadhaarKeywords = ["aadhaar", "unique", "government", "india", "identification"];
            const lowerFrontText = frontText.toLowerCase();
            const hasFrontKeywords = aadhaarKeywords.some(k => lowerFrontText.includes(k));

            if (frontData.aadhaarNumber === "Unknown" && !hasFrontKeywords) {
                throw new AppError(ERROR_MESSAGES.INVALID_FRONT_IMAGE, HttpStatus.BAD_REQUEST);
            }

            if (frontData.name === "Unknown" && frontData.dob === "Unknown") {
                if (frontData.address !== "Unknown") {
                    throw new AppError(ERROR_MESSAGES.FRONT_BACK_MISMATCH_SLOT_FRONT, HttpStatus.BAD_REQUEST);
                }
                throw new AppError(ERROR_MESSAGES.FRONT_DATA_NOT_FOUND, HttpStatus.BAD_REQUEST);
            }

            // 2. Process Back Side
            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);

            const lowerBackText = backText.toLowerCase();
            const hasBackKeywords = aadhaarKeywords.some(k => lowerBackText.includes(k));

            if (backData.aadhaarNumber === "Unknown" && !hasBackKeywords && backData.pincode === "Unknown") {
                throw new AppError(ERROR_MESSAGES.INVALID_BACK_IMAGE, HttpStatus.BAD_REQUEST);
            }

            if (frontText.trim() === backText.trim()) {
                throw new AppError(ERROR_MESSAGES.DUPLICATE_IMAGES, HttpStatus.BAD_REQUEST);
            }

            const isAddressInvalid = !backData.address || backData.address === "Unknown" || backData.address.length < 10;
            const isPincodeInvalid = !backData.pincode || backData.pincode === "Unknown";

            if (backData.name !== "Unknown" && isAddressInvalid && isPincodeInvalid) {
                throw new AppError(ERROR_MESSAGES.FRONT_BACK_MISMATCH_SLOT_BACK, HttpStatus.BAD_REQUEST);
            }

            if (isAddressInvalid && isPincodeInvalid) {
                throw new AppError(ERROR_MESSAGES.BACK_SIDE_NOT_RECOGNIZED, HttpStatus.BAD_REQUEST);
            }

            if (
                frontData.aadhaarNumber !== "Unknown" &&
                backData.aadhaarNumber !== "Unknown" &&
                frontData.aadhaarNumber.replace(/\D/g, "") !== backData.aadhaarNumber.replace(/\D/g, "")
            ) {
                throw new AppError(ERROR_MESSAGES.AADHAAR_NUMBER_MISMATCH, HttpStatus.BAD_REQUEST);
            }

            // Merge Data
            const finalData: Partial<AadhaarData> = {
                name: frontData.name,
                dob: frontData.dob,
                gender: frontData.gender,
                aadhaarNumber: frontData.aadhaarNumber !== "Unknown" ? frontData.aadhaarNumber : backData.aadhaarNumber,
                address: backData.address !== "Unknown" ? backData.address : frontData.address,
                pincode: backData.pincode !== "Unknown" ? backData.pincode : frontData.pincode,
            };

            return {
                success: true,
                data: parseAadhaarData(finalData),
            };
        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new AppError(`Aadhaar processing failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            for (const filePath of [frontPath, backPath]) {
                if (filePath && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }
    }
}
