import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
    Inject,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import type { IAadhaarService } from "../../interfaces/IServices";
import { uploadConfig } from "../../middleware/upload.midlleware";
import { ROUTES } from "../../constants/Routes";
import { ErrorMessages } from "../../constants/ErrorMessages";

@Controller(ROUTES.AADHAAR.BASE)
export class AadhaarController {
    constructor(@Inject('IAadhaarService') private readonly aadhaarService: IAadhaarService) { }

    @Post(ROUTES.AADHAAR.SCAN)
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
            throw new BadRequestException(ErrorMessages.IMAGES_REQUIRED);
        }

        const frontPath = files.frontImage[0].path;
        const backPath = files.backImage[0].path;

        return this.aadhaarService.processAadhaar(frontPath, backPath);
    }
}