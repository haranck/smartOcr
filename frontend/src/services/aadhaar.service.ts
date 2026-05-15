import { axiosInstance } from "../axios/axios.config";

export interface AadhaarScanResult {
    name: string;
    dob: string;
    gender: string;
    aadhaarNumber: string;
    address: string;
    pincode: string;
}

export const aadhaarService = {
    /**
     * Sends the front and back images of an Aadhaar card to the backend for OCR scanning.
     * @param frontFile The front image file
     * @param backFile The back image file
     * @returns The extracted Aadhaar data
     */
    async scanAadhaar(frontFile: File, backFile: File): Promise<AadhaarScanResult> {
        const formData = new FormData();
        
        // The names 'frontImage' and 'backImage' MUST match what the NestJS backend expects
        formData.append("frontImage", frontFile);
        formData.append("backImage", backFile);

        const response = await axiosInstance.post<{ success: boolean; data: AadhaarScanResult }>(
            "aadhaar/scan", 
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data.data;
    }
};
