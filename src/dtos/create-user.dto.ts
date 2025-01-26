import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password is too short. It should be at least 6 characters long.' })
  @MaxLength(20, { message: 'Password is too long. It should be less than 20 characters.' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  @Matches(/\d/, { message: 'Password must contain at least one number.' })
  password: string;
}