import { Service } from 'typedi';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from './UserService';
import { HttpError } from 'routing-controllers';

@Service()
export class AuthService {
    constructor(private userService: UserService) { }

    async login(credentials: { email: string, password: string }) {
        const user = await this.userService.findByEmail(credentials.email);
        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
            throw new HttpError(401, 'Invalid password');
        }

        const token = this.generateToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    async register(userData: { name: string; email: string; password: string }) {
        const existingUser = await this.userService.findByEmail(userData.email);

        if (existingUser) {
            throw new HttpError(400, 'User already exists');
        }

        const user = await this.userService.create({
            name: userData.name,
            email: userData.email,
            password: userData.password
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    private generateToken(userId: number) {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        return jwt.sign({ userId }, secret, { expiresIn: '24h' });
    }
}