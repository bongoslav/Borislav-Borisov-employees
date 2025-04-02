import { JsonController, Get, Post, Put, Delete, Param, Body, Authorized, HttpCode, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EmployeeService } from '../services/EmployeeService';

interface EmployeeDto {
    id: number;
}

@JsonController('/employees')
@Service()
export class EmployeeController {
    constructor(private employeeService: EmployeeService) { }

    @Authorized()
    @Get()
    async getAll() {
        return this.employeeService.findAll();
    }

    @Authorized()
    @Get('/:id')
    async getOne(@Param('id') id: number) {
        const employee = await this.employeeService.findById(id);
        if (!employee) {
            throw new NotFoundError('Employee not found');
        }
        return employee;
    }

    @Post()
    @HttpCode(201)
    async create(@Body() employee: EmployeeDto) {
        return this.employeeService.create(employee);
    }

    @Put('/:id')
    async update(@Param('id') id: number, @Body() employee: EmployeeDto) {
        const existingEmployee = await this.employeeService.findById(id);
        if (!existingEmployee) {
            throw new NotFoundError('Employee not found');
        }
        return this.employeeService.update(id, employee);
    }

    @Delete('/:id')
    async delete(@Param('id') id: number) {
        try {
            return await this.employeeService.delete(id);
        } catch (error: any) {
            // Check if it's a Prisma "not found" error
            if (error.code === 'P2025' || (error.message && error.message.includes('not found'))) {
                throw new NotFoundError('Employee not found');
            }
            throw error;
        }
    }
}