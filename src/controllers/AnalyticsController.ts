import { Get, Post, Authorized, UploadedFile, Controller } from 'routing-controllers';
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
  constructor(private analyticsService: AnalyticsService) {}

  @Authorized()
  @Get('/longest-collaboration')
  async getLongestCollaboration() {
    return this.analyticsService.findLongestCollaboration2();
  }

  @Post('/upload')
  async uploadCsv(@UploadedFile('file', { options: upload }) file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');

    return this.analyticsService.processCSV(file);
  }
}
