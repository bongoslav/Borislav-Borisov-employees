import { Service } from 'typedi';
import { prisma } from '../app';
import { HttpError } from 'routing-controllers';

@Service()
export class EmployeeService {
    async findAll() {
        return prisma.employee.findMany();
    }

    async findById(id: number) {
        const employee = await prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            throw new HttpError(404, 'Employee not found');
        }

        return employee;
    }

    async create(employeeData: { id: number; }) {
        return prisma.employee.create({
            data: {
                id: employeeData.id,
            },
        });
    }

    async update(id: number, employeeData: { id: number; }) {
        return prisma.employee.update({
            where: { id },
            data: {
                id: employeeData.id,
            },
        });
    }

    async delete(id: number) {
        await prisma.employee.delete({
            where: { id }
        });

        return { success: true, message: 'Employee deleted successfully' };
    }
}
