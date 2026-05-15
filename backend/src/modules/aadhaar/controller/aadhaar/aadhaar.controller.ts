import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AadhaarService } from "../../services/aadhaar/AadhaarService";
import { uploadConfig } from "../../middleware/upload.midlleware";

@Controller("aadhaar")
export class AadhaarController {
    constructor(private readonly aadhaarService: AadhaarService) { }

    @Post("scan")
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: "frontImage", maxCount: 1 },
                { name: "backImage", maxCount: 1 },
            ],
            uploadConfig
        )
    )
    async scanAadhaar(
        @UploadedFiles()
        files: {
            frontImage?: Express.Multer.File[];
            backImage?: Express.Multer.File[];
        }
    ) {
        if (!files?.frontImage?.[0] || !files?.backImage?.[0]) {
            throw new BadRequestException("Both front and back images of Aadhaar are required.");
        }

        const frontPath = files.frontImage[0].path;
        const backPath = files.backImage[0].path;

        console.log("--- New Aadhaar Scan Request ---");
        console.log("Front Image received:", files.frontImage[0].originalname, "->", frontPath);
        console.log("Back Image received:", files.backImage[0].originalname, "->", backPath);

        return this.aadhaarService.processAadhaar(frontPath, backPath);
    }
}
