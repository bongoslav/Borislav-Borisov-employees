import { JsonController, Get, Post, Put, Delete, Param, Body, Authorized, HttpCode, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { ProjectService } from '../services/ProjectService';

interface ProjectDto {
    name: string;
    description: string;
}

@JsonController('/projects')
@Service()
export class ProjectController {
    constructor(private projectService: ProjectService) { }

    @Authorized()
    @Get()
    async getAll() {
        return this.projectService.findAll();
    }

    @Authorized()
    @Get('/:id')
    async getOne(@Param('id') id: number) {
        try {
            return await this.projectService.findById(id);
        } catch (error: any) {
            throw new NotFoundError('Project not found');
        }
    }

    @Post()
    @HttpCode(201)
    async create(@Body() project: ProjectDto) {
        return this.projectService.create(project);
    }

    @Put('/:id')
    async update(@Param('id') id: number, @Body() project: Partial<ProjectDto>) {
        try {
            return await this.projectService.update(id, project);
        } catch (error: any) {
            throw new NotFoundError('Project not found');
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: number) {
        try {
            return await this.projectService.delete(id);
        } catch (error: any) {
            throw new NotFoundError('Project not found');
        }
    }
}
