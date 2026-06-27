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
    async scanAadhaar(frontFile: File, backFile: File): Promise<AadhaarScanResult> {
        const formData = new FormData();
        
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
