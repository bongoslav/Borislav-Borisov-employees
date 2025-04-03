import { Service } from "typedi";
import { prisma } from "../app";
import fs from "fs";
import csv from "csv-parser";
import { differenceInDays } from "date-fns";

const CHUNK_SIZE = 50;

@Service()
export class AnalyticsService {
	async processCSV(file: Express.Multer.File): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				const stream = fs.createReadStream(file.path).pipe(
					csv({
						headers: ["EmpID", "ProjectID", "DateFrom", "DateTo"],
						skipLines: 1,
						mapValues: ({ header, index, value }) => value.trim(),
					})
				);

				let chunk: any[] = [];
				let processedRows = 0;
				let rowsWithErrors = 0;

				stream
					.on("data", async (row) => {
						try {
							const { EmpID, ProjectID, DateFrom, DateTo } = row;
							
							if (!EmpID || !ProjectID || !DateFrom) {
								console.log('Skipping row with missing data:', row);
								rowsWithErrors++;
								return;
							}
							
							const dateFromProcessed = new Date(DateFrom);
							if (isNaN(dateFromProcessed.getTime())) {
								console.log('Skipping row with invalid date:', row);
								rowsWithErrors++;
								return;
							}
							
							const dateToProcessed = DateTo && DateTo !== "undefined" 
								? new Date(DateTo) 
								: new Date();
							
							if (isNaN(dateToProcessed.getTime())) {
								console.log('Skipping row with invalid date:', row);
								rowsWithErrors++;
								return;
							}

							chunk.push({
								employeeId: parseInt(EmpID, 10),
								projectId: parseInt(ProjectID, 10),
								dateFrom: dateFromProcessed,
								dateTo: dateToProcessed,
							});
							processedRows++;

							if (chunk.length >= CHUNK_SIZE) {
								stream.pause();
								try {
									await this.processChunk(chunk);
								} catch (error) {
									console.error('Error processing chunk:', error);
								}
								chunk = [];
								stream.resume();
							}
						} catch (error) {
							console.error('Error processing row:', error);
							rowsWithErrors++;
						}
					})
					.on("end", async () => {
						if (chunk.length > 0) {
							try {
								await this.processChunk(chunk);
							} catch (error) {
								console.error('Error processing final chunk:', error);
							}
						}
						resolve({ 
							message: "CSV processing completed", 
							processedRows: processedRows,
							rowsWithError: rowsWithErrors
						});
					})
					.on("error", (error: any) => {
						console.error('Stream error:', error);
						resolve({ message: "Error reading file", error: error.message });
					});
			} catch (error: any) {
				console.error('File processing error:', error);
				resolve({ message: "Error processing file", error: error.message });
			}
		});
	}

	private async processChunk(chunk: any[]) {
		console.log(`Processing chunk of ${chunk.length} rows...`);

		for (const data of chunk) {
			try {
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
			} catch (error) {
				console.error('Error processing database operation:', error);
			}
		}

		console.log(`Chunk processed successfully.`);
	}

	async findLongestCollaboration(): Promise<{
		emp1Id: number;
		emp2Id: number;
		totalDays: number;
	}> {
		try {
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
							// Calculate days of overlap including the start and end dates
							const overlapDays = differenceInDays(overlapEnd, overlapStart) + 1;

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
		} catch (error) {
			console.error('Error calculating collaborations:', error);
			return {
				emp1Id: 0,
				emp2Id: 0,
				totalDays: 0
			};
		}
	}
}
