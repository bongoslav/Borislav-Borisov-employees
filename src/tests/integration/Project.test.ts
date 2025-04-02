import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../testApp';
import { mockPrisma } from '../setup';

describe('Project API', () => {
    let app: Express;

    beforeEach(() => {
        jest.clearAllMocks();
        app = createTestApp();
    });

    describe('GET /api/v1/projects', () => {
        it('should return all projects', async () => {
            const mockProjects = [
                { id: 1, name: 'Project 1', description: 'Description 1' },
                { id: 2, name: 'Project 2', description: 'Description 2' },
            ];

            mockPrisma.project.findMany.mockResolvedValue(mockProjects);

            const response = await request(app)
                .get('/api/v1/projects')
                .expect(200);

            expect(mockPrisma.project.findMany).toHaveBeenCalled();
            expect(response.body).toEqual(mockProjects);
        });
    });

    describe('GET /api/v1/projects/:id', () => {
        it('should return a project by id', async () => {
            const mockProject = {
                id: 1,
                name: 'Project 1',
                description: 'Description 1',
            };

            mockPrisma.project.findUnique.mockResolvedValue(mockProject);

            const response = await request(app)
                .get('/api/v1/projects/1')
                .expect(200);

            expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(response.body).toEqual(mockProject);
        });

        it('should return 404 when project not found', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);

            await request(app)
                .get('/api/v1/projects/999')
                .expect(404);

            expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });
    });

    describe('POST /api/v1/projects', () => {
        it('should create a new project', async () => {
            const projectData = {
                name: 'New Project',
                description: 'New Description',
            };

            const createdProject = {
                id: 1,
                ...projectData,
            };

            mockPrisma.project.create.mockResolvedValue(createdProject);

            const response = await request(app)
                .post('/api/v1/projects')
                .send(projectData)
                .expect(201);

            expect(mockPrisma.project.create).toHaveBeenCalledWith({
                data: projectData
            });
            expect(response.body).toEqual(createdProject);
        });
    });

    describe('PUT /api/v1/projects/:id', () => {
        it('should update an existing project', async () => {
            const projectId = 1;
            const updateData = {
                name: 'Updated Project',
                description: 'Updated Description',
            };

            const existingProject = {
                id: projectId,
                name: 'Old Project',
                description: 'Old Description',
            };

            const updatedProject = {
                id: projectId,
                ...updateData,
            };

            mockPrisma.project.findUnique.mockResolvedValue(existingProject);
            mockPrisma.project.update.mockResolvedValue(updatedProject);

            const response = await request(app)
                .put(`/api/v1/projects/${projectId}`)
                .send(updateData)
                .expect(200);

            expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
                where: { id: projectId }
            });
            expect(mockPrisma.project.update).toHaveBeenCalledWith({
                where: { id: projectId },
                data: updateData
            });
            expect(response.body).toEqual(updatedProject);
        });

        it('should return 404 when project not found', async () => {
            const projectId = 999;
            const updateData = {
                name: 'Updated Project',
            };

            mockPrisma.project.findUnique.mockResolvedValue(null);

            await request(app)
                .put(`/api/v1/projects/${projectId}`)
                .send(updateData)
                .expect(404);

            expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
                where: { id: projectId }
            });
            expect(mockPrisma.project.update).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/v1/projects/:id', () => {
        it('should delete a project', async () => {
            const projectId = 1;
            const deletedProject = { id: projectId };

            mockPrisma.project.delete.mockResolvedValue(deletedProject);

            const response = await request(app)
                .delete(`/api/v1/projects/${projectId}`)
                .expect(200);

            expect(mockPrisma.project.delete).toHaveBeenCalledWith({
                where: { id: projectId }
            });
            expect(response.body).toEqual({ success: true });
        });

        it('should return 404 when project not found', async () => {
            const projectId = 999;

            mockPrisma.project.delete.mockRejectedValue(new Error('Project not found'));

            await request(app)
                .delete(`/api/v1/projects/${projectId}`)
                .expect(404);

            expect(mockPrisma.project.delete).toHaveBeenCalledWith({
                where: { id: projectId }
            });
        });
    });
}); 