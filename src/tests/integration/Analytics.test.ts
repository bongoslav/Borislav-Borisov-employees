import request from "supertest";
import { Express } from "express";
import { createTestApp } from "../testApp";
import { mockPrisma } from "../setup";
import * as fs from "fs";
import { Readable } from "stream";
import * as path from "path";

// mock the file system
jest.mock("fs");
jest.mock("csv-parser");

describe("Analytics API", () => {
	let app: Express;

	beforeEach(() => {
		jest.clearAllMocks();

		app = createTestApp();

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
			const mockEmployeeProjects = [
				{
					employeeId: 1,
					projectId: 1,
					dateFrom: new Date("2022-01-01"),
					dateTo: new Date("2022-06-30"),
				},
				{
					employeeId: 2,
					projectId: 1,
					dateFrom: new Date("2022-03-01"),
					dateTo: new Date("2022-06-30"),
				},
			];

			const expectedResult = {
				emp1Id: 1,
				emp2Id: 2,
				totalDays: 122,
			};

			mockPrisma.employeeProject.findMany.mockResolvedValue(
				mockEmployeeProjects
			);

			const response = await request(app)
				.get("/api/v1/analytics/longest-collaboration")
				.expect(200);

			expect(mockPrisma.employeeProject.findMany).toHaveBeenCalled();
			expect(response.body).toMatchObject(expectedResult);
		});

		it("should handle case with no collaborations", async () => {
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
			// Create a mock CSV content
			const csvContent =
				"EmpID,ProjectID,DateFrom,DateTo\n1,1,2022-01-01,2022-06-30\n2,1,2022-03-01,2022-06-30";
			const mockCsvBuffer = Buffer.from(csvContent);

			// Setup stream mocking
			const mockReadableStream = new Readable({
				read() {
					this.push(mockCsvBuffer);
					this.push(null); // End of stream
				},
			});

			// Mock fs.createReadStream
			(fs.createReadStream as jest.Mock).mockImplementation(() => {
				return mockReadableStream;
			});

			// Mock the necessary methods
			mockPrisma.employee.upsert.mockResolvedValue({ id: 1 });
			mockPrisma.project.upsert.mockResolvedValue({ id: 1 });
			mockPrisma.employeeProject.upsert.mockResolvedValue({
				employeeId: 1,
				projectId: 1,
				dateFrom: new Date("2022-01-01"),
				dateTo: new Date("2022-06-30"),
			});

			// Create a test file for upload
			const response = await request(app)
				.post("/api/v1/analytics/upload")
				.attach("file", mockCsvBuffer, {
					filename: "test.csv",
					contentType: "text/csv",
				})
				.expect(200);

			expect(response.body).toHaveProperty("message");
			expect(response.body.message).toContain("CSV processing");
		});

		it("should return error for invalid file format", async () => {
			// Create a mock non-CSV file
			const fileContent = "This is not a CSV file";
			const mockBuffer = Buffer.from(fileContent);

			const response = await request(app)
				.post("/api/v1/analytics/upload")
				.attach("file", mockBuffer, {
					filename: "test.txt",
					contentType: "text/plain",
				})
				.expect(400);

			expect(response.body).toHaveProperty("error");
		});
	});
});
