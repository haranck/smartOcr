import { Injectable } from "@nestjs/common";
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import { ENV } from "../../config/env.config";
import { AadhaarData, IOCRService } from "../../interfaces/IServices";

interface OcrSpaceResponse {
    ParsedResults?: { ParsedText: string }[];
    IsErroredOnProcessing: boolean;
    ErrorMessage: string[];
}

@Injectable()
export class OcrService implements IOCRService {
    private apiKey: string = ENV.OCR_SPACE_API_KEY;
    private apiUrl: string = ENV.OCR_API_URL;

    async processImage(imagePath: string): Promise<string> {
        try {
            const buffer = await sharp(imagePath)
                .resize(1000)
                .jpeg({ quality: 75 })
                .toBuffer();
            
            const formData = new FormData();
            formData.append('apikey', this.apiKey);
            formData.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

            const { data } = await axios.post<OcrSpaceResponse>(this.apiUrl, formData, { 
                headers: formData.getHeaders() 
            });

            if (data.IsErroredOnProcessing) {
                throw new Error(data.ErrorMessage[0]);
            }

            return data.ParsedResults?.[0]?.ParsedText || '';
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data as OcrSpaceResponse | undefined;
                throw new Error(String(errorData?.ErrorMessage?.[0] || error.message));
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unknown error occurred during OCR processing');
        }
    }

    parseData(text: string): AadhaarData {
        // 1. Sanitize text: Remove non-ASCII characters to filter out local languages
        const sanitizedText = text.replace(/[^\x20-\x7E\n]/g, ' ');
        
        const lines = sanitizedText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 2);
        
        const fullText = lines.join(' ');

        // 2. Extract Aadhaar Number (XXXX XXXX XXXX or XXXXXXXXXXXX)
        // Improved Regex: Looks for standalone blocks of 4 digits to avoid merging with Pincode
        const aadhaarMatch = fullText.match(/\b\d{4}\s\d{4}\s\d{4}\b/) || fullText.match(/\b\d{12}\b/);
        const aadhaarNumber = aadhaarMatch ? aadhaarMatch[0] : 'Unknown';
        
        // Find all potential numbers, but filter out common noise like phone numbers
        const allAadhaarNumbers = (fullText.match(/\d{4}[\s-]?\d{4}[\s-]?\d{4}/g) || [])
            .map((m: string) => m.replace(/\D/g, ""))
            .filter((num: string) => !num.includes('1947') && !num.includes('1800'));

        // 3. Extract Date of Birth
        const dobMatch = fullText.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);
        let dob = dobMatch ? dobMatch[0] : 'Unknown';
        if (dob === 'Unknown') {
            const yearMatch = fullText.match(/(?:Year of Birth|YOB)[:\s]*(\d{4})/i);
            if (yearMatch) dob = yearMatch[1];
        }

        // 4. Extract Gender
        let gender = 'Unknown';
        if (/female/i.test(fullText)) gender = 'Female';
        else if (/male/i.test(fullText)) gender = 'Male';

        // 5. Extract Pincode (6 digits)
        const pincodeMatch = fullText.match(/\b\d{6}\b/);
        const pincode = pincodeMatch ? pincodeMatch[0] : 'Unknown';

        // 6. Extract Name
        let name = 'Unknown';
        const headers = ['government', 'india', 'unique', 'identification', 'authority', 'aadhaar', 'enrollment', 'male', 'female', 'dob', 'birth', 'sarkar', 'bharat'];
        
        for (const line of lines) {
            const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
            const lowerLine = cleanLine.toLowerCase();
            
            if (cleanLine.split(' ').length >= 2 && 
                !headers.some(h => lowerLine.includes(h)) &&
                !/\d/.test(line)) {
                name = cleanLine;
                break;
            }
        }

        // 7. Extract Address
        let address = 'Unknown';
        const addressRegex = /(?:Address|C\/O|W\/O|S\/O|D\/O)[:\s]+([\s\S]+?)(?=\d{4}\s\d{4}\s\d{4}|$)/i;
        const addressMatch = sanitizedText.match(addressRegex);
        
        if (addressMatch) {
            address = addressMatch[1]
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            const pMatch = address.match(/\d{6}/);
            if (pMatch && pMatch.index !== undefined) {
                address = address.substring(0, pMatch.index + 6);
            }
        } else if (pincode !== 'Unknown') {
            const pincodeIndex = fullText.indexOf(pincode);
            if (pincodeIndex > 20) {
                const possibleAddress = fullText.substring(pincodeIndex - 100, pincodeIndex + 6).trim();
                address = possibleAddress.replace(/.*?(?:Address|[:])\s*/i, '').trim();
            }
        }

        return { name, dob, gender, aadhaarNumber, address, pincode, allAadhaarNumbers };
    }
}
