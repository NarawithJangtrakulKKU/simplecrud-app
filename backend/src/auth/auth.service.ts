import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto'
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;
        
        const user = await this.usersService.create(email, password, name);

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            message: 'User registered Successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);

        if(!user){
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordVaild = await this.comparePassword(password, user.password);

        if(!isPasswordVaild){
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            message: 'Login Successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        }


    }

    generateToken(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }

    async comparePassword(password: string, hashedPassword: string) {
        return bcrypt.compare(password, hashedPassword);
    }

    async validateUser(userId: string) {
        return this.usersService.findByEmail(userId);
    }
    
    
}
