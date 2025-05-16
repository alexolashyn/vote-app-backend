import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Poll } from './poll.entity';
import { Request } from './request.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  creatorId: number;

  @ManyToMany(() => User, (user) => user.organizations)
  @JoinTable()
  members: User[];


  @OneToMany(() => Poll, (poll) => poll.organization)
  polls: Poll[];

  @OneToMany(() => Request, (request) => request.organization)
  requests: Request[];
}
