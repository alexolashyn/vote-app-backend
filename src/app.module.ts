import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import { ConfigModule } from '@nestjs/config';
import { PollsModule } from './polls/polls.module';
import { Poll } from './polls/poll.entity';
import { Vote } from './polls/vote.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as any,
      database: process.env.DATABASE_NAME,
      entities: [User, Poll, Vote],
      synchronize: true,
    }),
    AuthModule,
    PollsModule,
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {
}
