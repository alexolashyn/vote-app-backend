import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
  }

  private async generateToken(user: any): Promise<{ token: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { token: this.jwtService.sign(payload) };
  }

  async register(email: string, password: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Provided email is already in use!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Provided credentials are invalid!');
    }
    const isValidPassword = !(await bcrypt.compare(password, user.password));
    if (isValidPassword) {
      throw new BadRequestException('Provided credentials are invalid!');
    }
    return this.generateToken(user);
  }

  async validateUser(userId: number) {
    return this.userRepository.findOne({
      where:
        {
          id: userId,
        },
    });
  }
}
