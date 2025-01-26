import { Entity, PrimaryGeneratedColumn, Column, AfterInsert, AfterRemove } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @AfterInsert()
  logInsert() {
    console.log(`Inserted user with email ${this.email}`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Removed user with email ${this.email}`);
  }
}
