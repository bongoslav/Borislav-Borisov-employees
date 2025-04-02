import { Service } from "typedi";
import { prisma } from "../app";
import fs from "fs";
import csv from "csv-parser";
import { subDays, parseISO, differenceInDays, startOfDay } from "date-fns";

interface CollaborationTime {
	emp1Id: number;
	emp2Id: number;
	totalDays: number;
}

const CHUNK_SIZE = 50;

@Service()
export class AnalyticsService {
	async processCSV(file: Express.Multer.File): Promise<any> {
		return new Promise((resolve, reject) => {
			const stream = fs.createReadStream(file.path).pipe(
				csv({
					headers: ["EmpID", "ProjectID", "DateFrom", "DateTo"],
					skipLines: 1,
					mapValues: ({ header, index, value }) => value.trim(),
				})
			);

			let chunk: any[] = [];

			stream
				.on("data", async (row) => {
					const { EmpID, ProjectID, DateFrom, DateTo } = row;

					const dateFromProcessed = new Date(DateFrom);
					const dateToProcessed =
						DateTo !== "undefined"
							? new Date(DateTo)
							: new Date(new Date().toDateString());

					chunk.push({
						employeeId: parseInt(EmpID, 10),
						projectId: parseInt(ProjectID, 10),
						dateFrom: dateFromProcessed,
						dateTo: dateToProcessed,
					});

					if (chunk.length >= CHUNK_SIZE) {
						stream.pause();
						await this.processChunk(chunk);
						chunk = [];
						stream.resume();
					}
				})
				.on("end", async () => {
					if (chunk.length > 0) {
						await this.processChunk(chunk);
					}
					resolve({ message: "CSV processing completed" });
				})
				.on("error", (error) => reject(error));
		});
	}

	private async processChunk(chunk: any[]) {
		console.log(`Processing chunk of ${chunk.length} rows...`);

		await Promise.all(
			chunk.map(async (data) => {
				const { employeeId, projectId, dateFrom, dateTo } = data;

				await prisma.employee.upsert({
					where: { id: employeeId },
					update: {},
					create: { id: employeeId },
				});

				await prisma.project.upsert({
					where: { id: projectId },
					update: {},
					create: { id: projectId },
				});

				// upsert EmployeeProject to prevent unique constraint violation
				await prisma.employeeProject.upsert({
					where: {
						employeeId_projectId_dateFrom_dateTo: {
							employeeId,
							projectId,
							dateFrom,
							dateTo,
						},
					},
					update: {},
					create: {
						employeeId,
						projectId,
						dateFrom,
						dateTo,
					},
				});
			})
		);

		console.log(`Chunk processed successfully.`);
	}

	async findLongestCollaboration2(): Promise<{
		emp1Id: number;
		emp2Id: number;
		totalDays: number;
	}> {
		const employeeProjects = await prisma.employeeProject.findMany();

		// group projects by projectId to find employees working on the same project
		const projectsMap = new Map<
			number,
			Array<{
				employeeId: number;
				dateFrom: Date;
				dateTo: Date;
			}>
		>();

		employeeProjects.forEach((project) => {
			if (!projectsMap.has(project.projectId)) {
				projectsMap.set(project.projectId, []);
			}

			projectsMap.get(project.projectId)!.push({
				employeeId: project.employeeId,
				dateFrom: new Date(project.dateFrom),
				dateTo: new Date(project.dateTo),
			});
		});

		// calculate overlapping periods for each pair of employees
		const collaborations = new Map<string, number>();

		projectsMap.forEach((employees) => {
			for (let i = 0; i < employees.length; i++) {
				for (let j = i + 1; j < employees.length; j++) {
					const emp1 = employees[i];
					const emp2 = employees[j];

					const overlapStart = new Date(
						Math.max(emp1.dateFrom.getTime(), emp2.dateFrom.getTime())
					);
					const overlapEnd = new Date(
						Math.min(emp1.dateTo.getTime(), emp2.dateTo.getTime())
					);

					if (overlapStart <= overlapEnd) {
						const overlapDays = Math.floor(
							(overlapEnd.getTime() - overlapStart.getTime()) /
							(1000 * 60 * 60 * 24) // ms to days
						);

						// accumulate total collaboration time for this unique pair
						const minEmpId = Math.min(emp1.employeeId, emp2.employeeId);
						const maxEmpId = Math.max(emp1.employeeId, emp2.employeeId);
						const pairKey = `${minEmpId}-${maxEmpId}`;

						collaborations.set(
							pairKey,
							(collaborations.get(pairKey) || 0) + overlapDays
						);
					}
				}
			}
		});

		// find the pair with the longest collaboration
		let maxDays = 0;
		let longestPair: [number, number] = [0, 0];

		collaborations.forEach((days, pairKey) => {
			if (days > maxDays) {
				maxDays = days;
				const [emp1, emp2] = pairKey.split("-").map(Number);
				longestPair = [emp1, emp2];
			}
		});

		return {
			emp1Id: longestPair[0],
			emp2Id: longestPair[1],
			totalDays: maxDays,
		};
	}
}
