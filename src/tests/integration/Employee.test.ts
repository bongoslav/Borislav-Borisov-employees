import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../testApp';
import { mockPrisma } from '../setup';

describe('Employee API', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
  });

  describe('GET /api/v1/employees', () => {
    it('should return all employees', async () => {
      const mockEmployees = [
        { id: 1, name: 'Employee 1', position: 'Developer' },
        { id: 2, name: 'Employee 2', position: 'Manager' },
      ];
      
      mockPrisma.employee.findMany.mockResolvedValue(mockEmployees);
      
      const response = await request(app)
        .get('/api/v1/employees')
        .expect(200);
      
      expect(mockPrisma.employee.findMany).toHaveBeenCalled();
      expect(response.body).toEqual(mockEmployees);
    });
  });
  
  describe('GET /api/v1/employees/:id', () => {
    it('should return an employee by id', async () => {
      const mockEmployee = { 
        id: 1, 
        name: 'Employee 1', 
        position: 'Developer' 
      };
      
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      
      const response = await request(app)
        .get('/api/v1/employees/1')
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
        .expect(404);
      
      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
    });
  });
  
  describe('POST /api/v1/employees', () => {
    it('should create a new employee', async () => {
      const employeeData = {
        id: 1,
        name: 'New Employee',
        position: 'Designer',
      };
      
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
      const updateData = {
        id: employeeId,
        name: 'Updated Employee',
        position: 'Senior Developer',
      };
      
      const existingEmployee = { 
        id: employeeId, 
        name: 'Old Name', 
        position: 'Developer' 
      };
      
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
      const updateData = {
        id: employeeId,
        name: 'Updated Employee',
        position: 'Senior Developer',
      };
      
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
      
      mockPrisma.employee.delete.mockRejectedValue(new Error('Employee not found'));
      
      await request(app)
        .delete(`/api/v1/employees/${employeeId}`)
        .expect(404);
      
      expect(mockPrisma.employee.delete).toHaveBeenCalledWith({
        where: { id: employeeId }
      });
    });
  });
}); 