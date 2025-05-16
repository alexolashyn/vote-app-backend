import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  AfterInsert,
  AfterRemove,
  ManyToMany,
  OneToMany
} from 'typeorm';
import { Organization } from './organization.entity';
import {Request} from './request.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', default: UserRole.USER })
  role: UserRole;

  @ManyToMany(() => Organization, (organization) => organization.members)
  organizations: Organization[];

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[];


  @AfterInsert()
  logInsert() {
    console.log(`Inserted user with email ${this.email}`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Removed user with email ${this.email}`);
  }
}
