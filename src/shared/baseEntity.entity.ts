import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export abstract class baseEntity{
  @PrimaryKey()
  id?: number

  @Property()
  name!: string

}