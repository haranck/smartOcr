export interface AadhaarData {
    name: string;
    dob: string;
    gender: string;
    aadhaarNumber: string;
    address: string;
    pincode: string;
}

export function parseAadhaarData(data: Partial<AadhaarData>): AadhaarData {
    return {
        name: data.name ?? 'Unknown',
        dob: data.dob ?? 'Unknown',
        gender: data.gender ?? 'Unknown',
        aadhaarNumber: data.aadhaarNumber ?? 'Unknown',
        address: data.address ?? 'Unknown',
        pincode: data.pincode ?? 'Unknown',
    };
}