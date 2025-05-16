import { IsNotEmpty, IsString, IsArray, MinLength, ArrayMinSize, IsOptional, IsNumber } from 'class-validator';

export class CreatePollDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'There must be at least two options' })
  @IsString({ each: true })
  options: string[];

  @IsOptional()
  @MinLength(3, { message: 'Description must be at least 3 characters long' })
  description: string;
}
