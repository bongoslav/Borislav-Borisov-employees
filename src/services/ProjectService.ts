import { Service } from 'typedi';
import { prisma } from '../app';

@Service()
export class ProjectService {
    async findAll() {
        return prisma.project.findMany();
    }

    async findById(id: number) {
        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            throw new Error('Project not found');
        }

        return project;
    }

    async create(projectData: { name: string; description: string }) {
        return prisma.project.create({
            data: projectData
        });
    }

    async update(id: number, projectData: { name?: string; description?: string }) {
        await this.findById(id);

        return prisma.project.update({
            where: { id },
            data: projectData
        });
    }

    async delete(id: number) {
        await prisma.project.delete({
            where: { id }
        });

        return { success: true };
    }
}
