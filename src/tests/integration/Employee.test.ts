import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../testApp';
import { mockPrisma, mockUserService } from '../setup';

describe('Employee API', () => {
    let app: Express;
    const authToken = 'test-token';

    beforeEach(() => {
        jest.clearAllMocks();
        app = createTestApp();
        
        // mock the user authentication
        mockUserService.findById.mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
        });
    });

    describe('GET /api/v1/employees', () => {
        it('should return all employees', async () => {
            const mockEmployees = [
                { id: 1 },
                { id: 2 },
            ];

            mockPrisma.employee.findMany.mockResolvedValue(mockEmployees);

            const response = await request(app)
                .get('/api/v1/employees')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(mockPrisma.employee.findMany).toHaveBeenCalled();
            expect(response.body).toEqual(mockEmployees);
        });
    });

    describe('GET /api/v1/employees/:id', () => {
        it('should return an employee by id', async () => {
            const mockEmployee = { id: 1 };

            mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

            const response = await request(app)
                .get('/api/v1/employees/1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(response.body).toEqual(mockEmployee);
        });

        it('should return 404 when employee not found', async () => {
            mockPrisma.employee.findUnique.mockResolvedValue(null);

            await request(app)
                .get('/api/v1/employees/999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });
    });

    describe('POST /api/v1/employees', () => {
        it('should create a new employee', async () => {
            const employeeData = { id: 1 };

            mockPrisma.employee.create.mockResolvedValue(employeeData);

            const response = await request(app)
                .post('/api/v1/employees')
                .send(employeeData)
                .expect(201);

            expect(mockPrisma.employee.create).toHaveBeenCalledWith({
                data: employeeData
            });
            expect(response.body).toEqual(employeeData);
        });
    });

    describe('PUT /api/v1/employees/:id', () => {
        it('should update an existing employee', async () => {
            const employeeId = 1;
            const updateData = { id: employeeId };
            const existingEmployee = { id: employeeId };

            mockPrisma.employee.findUnique.mockResolvedValue(existingEmployee);
            mockPrisma.employee.update.mockResolvedValue(updateData);

            const response = await request(app)
                .put(`/api/v1/employees/${employeeId}`)
                .send(updateData)
                .expect(200);

            expect(mockPrisma.employee.update).toHaveBeenCalledWith({
                where: { id: employeeId },
                data: updateData
            });
            expect(response.body).toEqual(updateData);
        });

        it('should return 404 when employee not found', async () => {
            const employeeId = 999;
            const updateData = { id: employeeId };

            mockPrisma.employee.findUnique.mockResolvedValue(null);

            await request(app)
                .put(`/api/v1/employees/${employeeId}`)
                .send(updateData)
                .expect(404);

            expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
                where: { id: employeeId }
            });
            expect(mockPrisma.employee.update).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/v1/employees/:id', () => {
        it('should delete an employee', async () => {
            const employeeId = 1;
            const deletedEmployee = { id: employeeId };

            mockPrisma.employee.delete.mockResolvedValue(deletedEmployee);

            const response = await request(app)
                .delete(`/api/v1/employees/${employeeId}`)
                .expect(200);

            expect(mockPrisma.employee.delete).toHaveBeenCalledWith({
                where: { id: employeeId }
            });
            expect(response.body).toEqual({
                success: true,
                message: 'Employee deleted successfully'
            });
        });

        it('should return 404 when employee not found', async () => {
            const employeeId = 999;

            // Customize the error for appropriate 404 handling
            const notFoundError = new Error('Employee not found');
            (notFoundError as any).code = 'P2025'; // Prisma not found error code
            mockPrisma.employee.delete.mockRejectedValue(notFoundError);

            await request(app)
                .delete(`/api/v1/employees/${employeeId}`)
                .expect(404);

            expect(mockPrisma.employee.delete).toHaveBeenCalledWith({
                where: { id: employeeId }
            });
        });
    });
}); 