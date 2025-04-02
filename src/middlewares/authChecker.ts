import { Action } from 'routing-controllers';
import * as jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { UserService } from '../services/UserService';

export const authorizationChecker = async (action: Action, roles: string[]) => {
    try {
        const authHeader = action.request.headers['authorization'];
        if (!authHeader) return false;

        const token = authHeader.split(' ')[1];
        if (!token) return false;

        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded: any = jwt.verify(token, secret);

        const userService = Container.get(UserService);
        const user = await userService.findById(decoded.userId);

        if (!user) return false;

        action.request.user = user;

        return true;
    } catch (error) {
        return false;
    }
}
