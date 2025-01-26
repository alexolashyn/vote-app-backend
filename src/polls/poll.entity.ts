import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Vote } from './vote.entity';

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

  @Column({ type: 'datetime', nullable: true })
  endAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Vote, (vote) => vote.poll)
  votes: Vote[];

  @BeforeInsert()
  setDates() {
    const currentDate = new Date();
    this.createdAt = currentDate;
    if (!this.endAt) {
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + 7);
      this.endAt = endDate;
    }
  }

  checkActive() {
    const currentDate = new Date();
    if (this.endAt && currentDate > this.endAt) {
      this.isActive = false;
    }
  }
}
