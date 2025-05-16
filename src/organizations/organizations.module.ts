import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Request } from '../entities/request.entity';
import { PollsModule } from '../polls/polls.module';
import { AdminGuard } from '../guards/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User, Request]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    PollsModule,
  ],
  providers: [OrganizationsService, AdminGuard],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {
}
