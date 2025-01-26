import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../dtos/user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: CreateUserDto) {
    return this.authService.login(body.email, body.password);
  }


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Serialize(UserDto)
  getProfile(@Request() req) {
    return req.user;
  }
}
