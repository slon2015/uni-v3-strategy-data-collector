import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

export class Token {
  @Column({ type: "smallint" })
  decimals: number;
}

@Entity()
@Unique("pool_chain_id_address_uq", ["chainId", "address"])
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "chain_id", type: "integer" })
  chainId: number;

  @Column()
  address: string;

  @Column(() => Token)
  token0: Token;

  @Column(() => Token)
  token1: Token;

  @OneToMany(() => Price, (price) => price.pool)
  prices: Array<Price>;
}

@Entity()
@Unique("price_block_number_pool_uq", ["blockNumber", "pool"])
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "block_number" })
  blockNumber: number;

  @Column({ name: "price" })
  price: string;

  @ManyToOne(() => Pool, (pool) => pool.prices)
  pool: Pool;
}
