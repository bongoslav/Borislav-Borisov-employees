import { JsonController, Get, Post, Put, Delete, Param, Body, Authorized } from 'routing-controllers';
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
        return this.projectService.findById(id);
    }

    @Post()
    async create(@Body() project: ProjectDto) {
        return this.projectService.create(project);
    }

    @Put('/:id')
    async update(@Param('id') id: number, @Body() project: Partial<ProjectDto>) {
        return this.projectService.update(id, project);
    }

    @Delete('/:id')
    async delete(@Param('id') id: number) {
        return this.projectService.delete(id);
    }
}
