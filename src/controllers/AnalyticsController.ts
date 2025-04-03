import { Get, Post, Authorized, UploadedFile, Controller } from 'routing-controllers';
import { Service } from 'typedi';
import { AnalyticsService } from '../services/AnalyticsService';
import { upload, removeFile } from '../middlewares/multerConfig';

@Controller('/analytics')
@Service()
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Authorized()
    @Get('/longest-collaboration')
    async getLongestCollaboration() {
        try {
            return await this.analyticsService.findLongestCollaboration();
        } catch (error: any) {
            return { 
                success: false, 
                message: 'Failed to calculate collaboration data', 
                error: error.message 
            };
        }
    }

    @Post('/upload')
    async uploadCsv(@UploadedFile('file', { options: upload, required: true }) file: Express.Multer.File) {
        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }
        
        try {
            const result = await this.analyticsService.processCSV(file);
            return { success: true, ...result };
        } catch (error: any) {
            // cLean up the file on error
            if (file && file.path) {
                removeFile(file.path);
            }
            
            return { 
                success: false, 
                message: error.message || 'Error processing file' 
            };
        }
    }
}
