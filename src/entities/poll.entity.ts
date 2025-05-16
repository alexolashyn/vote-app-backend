import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne
} from 'typeorm';
import { Vote } from './vote.entity';
import {Organization} from './organization.entity';

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('simple-array')
  options: string[];

  @Column()
  creatorId: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Vote, (vote) => vote.poll)
  votes: Vote[];

  @ManyToOne(() => Organization, (organization) => organization.polls, { onDelete: 'CASCADE' })
  organization: Organization;
}
