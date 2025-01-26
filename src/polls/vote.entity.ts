import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Poll } from './poll.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pollId: number;

  @Column()
  userId: number;

  @Column()
  option: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Poll, (poll) => poll.votes)
  poll: Poll;
}
