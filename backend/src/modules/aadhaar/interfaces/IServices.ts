export interface AadhaarData {
  name: string;
  dob: string;
  gender: string;
  aadhaarNumber: string;
  address: string;
  pincode: string;
  allAadhaarNumbers?: string[];
}

export interface IOCRService {
  processImage(imagePath: string): Promise<string>;
  parseData(text: string): AadhaarData;
}

export interface IAadhaarService {
  processAadhaar(frontPath: string, backPath: string): Promise<any>;
}
