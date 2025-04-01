import { JsonController, Post, Body } from 'routing-controllers';
import { Service } from 'typedi';
import { AuthService } from '../services/AuthService';

@JsonController('/auth')
@Service()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.login(credentials);
  }

  @Post('/register')
  async register(@Body() userData: { name: string; email: string; password: string }) {
    return this.authService.register(userData);
  }
}
