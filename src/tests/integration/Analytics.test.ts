import request from "supertest";
import { Express } from "express";
import { createTestApp } from "../testApp";
import { mockPrisma, mockUserService } from "../setup";
import { Request, Response, NextFunction } from 'express';

// we need to mock multer to avoid actual file uploads during tests
// this creates a fake implementation that doesn't access the file system
jest.mock('multer', () => {
	const multerMock: any = jest.fn().mockImplementation(() => {
		return {
			single: () => (req: Request, res: Response, next: NextFunction) => {
				if (req.path.includes('/upload')) {
					// add a mock file object to the request
					req.file = {
						originalname: req.headers['x-filename'] as string || 'test.csv',
						mimetype: req.headers['content-type'] as string || 'text/csv',
						path: 'mocked-path',
						buffer: Buffer.from('test content'),
					} as Express.Multer.File;
				}
				next();
			}
		};
	});
	
	// multer.diskStorage is used in the real app, so we need to mock this method
	// to prevent errors when the controller tries to use it during tests
	multerMock.diskStorage = jest.fn().mockImplementation((opts) => {
		return { storageOpts: opts }; // just return something that won't be used
	});
	
	return multerMock;
});

// we mock the fs module to avoid real file system operations during tests
// this provides a controlled readable stream with predictable CSV content
jest.mock('fs', () => ({
	createReadStream: jest.fn().mockImplementation(() => {
		const { Readable } = require('stream');
		const mockContent = 
`EmpID, ProjectID, DateFrom, DateTo 
143, 12, 2013-11-01, 2014-01-05 
218, 10, 2011-04-16, undefined 
143, 10, 2009-01-01, 2011-04-27 
148, 12, 2012-01-01, 2013-12-01`;
		
		const readable = new Readable();
		readable._read = () => {};
		readable.push(mockContent);
		readable.push(null);
		return readable;
	})
}));

// we mock csv-parser to control the parsing process without relying on the actual library
// this ensures our tests receive consistent, predetermined data regardless of the actual CSV parsing
jest.mock('csv-parser', () => {
	return () => {
		const { Transform } = require('stream');
		const transform = new Transform({
			objectMode: true,
			transform(chunk: any, encoding: string, callback: Function) {
				// parse the CSV content and emit mock row objects
				const rows = [
					{ EmpID: '143', ProjectID: '12', DateFrom: '2013-11-01', DateTo: '2014-01-05' },
					{ EmpID: '218', ProjectID: '10', DateFrom: '2011-04-16', DateTo: 'undefined' },
					{ EmpID: '143', ProjectID: '10', DateFrom: '2009-01-01', DateTo: '2011-04-27' },
					{ EmpID: '148', ProjectID: '12', DateFrom: '2012-01-01', DateTo: '2013-12-01' }
				];
				
				rows.forEach(row => this.push(row));
				callback();
			}
		});
		return transform;
	};
});

describe("Analytics API", () => {
	let app: Express;
	const authToken = 'test-token';

	beforeEach(() => {
		jest.clearAllMocks();

		app = createTestApp();

		// mock user for authentication
		mockUserService.findById.mockResolvedValue({
			id: 1,
			name: 'Test User',
			email: 'test@example.com'
		});

		// setup the employeeProject mock
		if (!mockPrisma.employeeProject) {
			mockPrisma.employeeProject = {
				findMany: jest.fn(),
				upsert: jest.fn(),
			};
		}
	});

	describe("GET /api/v1/analytics/longest-collaboration", () => {
		it("should return the longest collaboration between employees", async () => {
			// mock data based on example.csv
			const mockEmployeeProjects = [
				{
					employeeId: 143,
					projectId: 12,
					dateFrom: new Date("2013-11-01"),
					dateTo: new Date("2014-01-05"),
				},
				{
					employeeId: 218,
					projectId: 10,
					dateFrom: new Date("2011-04-16"),
					dateTo: new Date("2023-01-01"),
				},
				{
					employeeId: 143,
					projectId: 10,
					dateFrom: new Date("2009-01-01"),
					dateTo: new Date("2011-04-27"),
				},
				{
					employeeId: 148,
					projectId: 12,
					dateFrom: new Date("2012-01-01"),
					dateTo: new Date("2013-12-01"),
				},
			];

			const expectedResult = {
				emp1Id: 143,
				emp2Id: 148,
				totalDays: 31, // days of overlap on project 12
			};

			mockPrisma.employeeProject.findMany.mockResolvedValue(
				mockEmployeeProjects
			);

			const response = await request(app)
				.get("/api/v1/analytics/longest-collaboration")
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(mockPrisma.employeeProject.findMany).toHaveBeenCalled();
			expect(response.body).toMatchObject(expectedResult);
		});

		it("should handle case with no collaborations", async () => {
			// mock data where there's no overlap
			const mockEmployeeProjects = [
				{
					employeeId: 1,
					projectId: 1,
					dateFrom: new Date("2022-01-01"),
					dateTo: new Date("2022-01-31"),
				},
				{
					employeeId: 2,
					projectId: 1,
					dateFrom: new Date("2022-02-01"),
					dateTo: new Date("2022-02-28"),
				},
			];

			mockPrisma.employeeProject.findMany.mockResolvedValue(
				mockEmployeeProjects
			);

			const response = await request(app)
				.get("/api/v1/analytics/longest-collaboration")
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(mockPrisma.employeeProject.findMany).toHaveBeenCalled();
			expect(response.body).toEqual({
				emp1Id: 0,
				emp2Id: 0,
				totalDays: 0,
			});
		});
	});

	describe("POST /api/v1/analytics/upload", () => {
		it("should process CSV file and return success response", async () => {
			mockPrisma.employee.upsert.mockResolvedValue({});
			mockPrisma.project.upsert.mockResolvedValue({});
			mockPrisma.employeeProject.upsert.mockResolvedValue({});

			const response = await request(app)
				.post("/api/v1/analytics/upload")
				.set('x-filename', 'example.csv')
				.set('content-type', 'text/csv')
				.expect(200);

			expect(response.body).toHaveProperty("message");
			expect(response.body.message).toContain("CSV processing");
		});

		it("should return error for invalid file format", async () => {
			// test with an invalid file
			const response = await request(app)
				.post("/api/v1/analytics/upload")
				.set('x-filename', 'test.txt')
				.set('content-type', 'text/plain')
				.expect(400);

			expect(response.body).toHaveProperty("message");
			expect(response.body.success).toBe(false);
		});
	});
});
