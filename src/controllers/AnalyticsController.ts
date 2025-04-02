import { Get, Post, Authorized, UploadedFile, Controller, HttpError, BadRequestError } from 'routing-controllers';
import { Service } from 'typedi';
import { AnalyticsService } from '../services/AnalyticsService';
import { upload } from '../middlewares/multerConfig';

interface EmployeeProjectDto {
    employeeId: number;
    projectId: number;
    dateFrom: Date;
    dateTo?: Date | null;
}

@Controller('/analytics')
@Service()
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Authorized()
    @Get('/longest-collaboration')
    async getLongestCollaboration() {
        return this.analyticsService.findLongestCollaboration();
    }

    @Post('/upload')
    async uploadCsv(@UploadedFile('file', { options: upload }) file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestError('No file uploaded');
        }
        
        // Check if the file is a CSV
        if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
            throw new BadRequestError('Invalid file format. Please upload a CSV file.');
        }
        
        try {
            return await this.analyticsService.processCSV(file);
        } catch (error: any) {
            throw new HttpError(400, `Error processing CSV: ${error.message}`);
        }
    }
}
