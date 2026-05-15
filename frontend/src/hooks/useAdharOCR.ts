import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { aadhaarService, type AadhaarScanResult } from '../services/aadhaar.service';
import { ErrorMessages } from '../constants/messages';

export const useAadhaarOCR = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<AadhaarScanResult | null>(null);

    const processImages = async (frontImage: File | null, backImage: File | null) => {
        if (!frontImage || !backImage) {
            toast.error(ErrorMessages.MISSING_BOTH_IMAGES);
            return;
        }

        // 1. Duplicate Check: Front and Back should not be the same file
        if (frontImage.name === backImage.name && frontImage.size === backImage.size) {
            toast.error("You have uploaded the same image for both sides. Please upload the front and back separately.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const data = await aadhaarService.scanAadhaar(frontImage, backImage);
            
            setResult(data);
            toast.success('Aadhaar data extracted successfully!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : ErrorMessages.EXTRACTION_FAILED;
            toast.error(message);
            console.error("OCR Hook Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const resetOCR = () => {
        setResult(null);
        setLoading(false);
    };

    return {
        loading,
        result,
        processImages,
        resetOCR
    };
};
