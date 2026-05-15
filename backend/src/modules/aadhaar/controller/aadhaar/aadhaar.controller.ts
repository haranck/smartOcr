import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AadhaarService } from "../../services/aadhaar/aadhaar.service";
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

        return this.aadhaarService.processAadhaar(frontPath, backPath);
    }
}
