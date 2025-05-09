import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);
    
    // เก็บ token ใน cookie
    this.setCookie(response, result.token);
    
    return result;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    
    // เก็บ token ใน cookie
    this.setCookie(response, result.token);
    
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    // ลบ cookie
    response.clearCookie('token');
    
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  private setCookie(response: Response, token: string) {
    response.cookie('token', token, {
      httpOnly: true, // ป้องกันการเข้าถึงจาก JavaScript
      secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ในโหมด production
      sameSite: 'strict', // ป้องกัน CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // หมดอายุใน 7 วัน
    });
  }
}