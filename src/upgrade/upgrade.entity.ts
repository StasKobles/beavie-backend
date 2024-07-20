import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('upgrades')
export class Upgrade {
  @PrimaryGeneratedColumn()
  upgrade_id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  base_cost: number;

  @Column('int')
  base_income: number;

  @Column('double precision')
  upgrade_factor: number;
}
