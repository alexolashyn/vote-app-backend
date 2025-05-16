import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateOrgDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  members: string[];

}
