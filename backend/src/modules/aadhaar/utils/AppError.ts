import { HttpException } from "@nestjs/common";
import { HttpStatus } from "../constants/HttpStatus";

export class AppError extends HttpException {
    constructor(message: string, statusCode: HttpStatus) {
        super(message, statusCode);
    }
}
