import { Entity, Opt, PrimaryKey, Property } from '@mikro-orm/core';

export type SecurityEventType =
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_BY_TOKEN'
  | 'ADMIN_PASSWORD_RESET'
  | 'REAUTHENTICATION';

@Entity()
export class SecurityAuditLog {
  @PrimaryKey()
  id?: number;

  @Property({ nullable: false })
  event_type!: SecurityEventType;

  @Property({ nullable: false })
  target_user_id!: number;

  @Property({ nullable: true })
  actor_user_id?: number;

  @Property({ nullable: true })
  ip_address?: string;

  @Property({ nullable: true })
  user_agent?: string;

  @Property({ nullable: true })
  details?: string;

  @Property({ nullable: false })
  created_at: Date & Opt = new Date();
}
