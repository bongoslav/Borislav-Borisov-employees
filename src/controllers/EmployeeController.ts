import { JsonController, Get, Post, Put, Delete, Param, Body, Authorized } from 'routing-controllers';
import { Service } from 'typedi';
import { EmployeeService } from '../services/EmployeeService';

interface EmployeeDto {
  id: number;
}

@JsonController('/employees')
@Service()
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Authorized()
  @Get()
  async getAll() {
    return this.employeeService.findAll();
  }

  @Authorized()
  @Get('/:id')
  async getOne(@Param('id') id: number) {
    return this.employeeService.findById(id);
  }

  @Post()
  async create(@Body() employee: EmployeeDto) {
    return this.employeeService.create(employee);
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() employee: EmployeeDto) {
    return this.employeeService.update(id, employee);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return this.employeeService.delete(id);
  }
}