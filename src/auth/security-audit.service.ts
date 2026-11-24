import { Request } from 'express';
import { orm } from '../shared/db/orm.js';
import {
  SecurityAuditLog,
  SecurityEventType,
} from './security-audit-log.entity.js';

export interface LogSecurityEventInput {
  eventType: SecurityEventType;
  targetUserId: number;
  actorUserId?: number;
  req?: Request;
  details?: string;
}

export function extractClientIp(req?: Request): string | undefined {
  if (!req) return undefined;
  const forwardedFor = req.headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || undefined;
}

export async function recordSecurityEvent({
  eventType,
  targetUserId,
  actorUserId,
  req,
  details,
}: LogSecurityEventInput): Promise<void> {
  const ipAddress = extractClientIp(req);
  const userAgent =
    typeof req?.headers?.['user-agent'] === 'string'
      ? req.headers['user-agent']
      : undefined;
  const createdAt = new Date();

  console.info(
    '[SECURITY_AUDIT]',
    JSON.stringify({
      event_type: eventType,
      target_user_id: targetUserId,
      actor_user_id: actorUserId ?? null,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
      details: details ?? null,
      created_at: createdAt.toISOString(),
    }),
  );

  try {
    const em = orm.em.fork();
    const auditEntry = em.create(SecurityAuditLog, {
      event_type: eventType,
      target_user_id: targetUserId,
      actor_user_id: actorUserId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      created_at: createdAt,
    });
    await em.persistAndFlush(auditEntry);
  } catch (err) {
    console.warn(
      '[SECURITY_AUDIT] No se pudo persistir el evento en BD:',
      err instanceof Error ? err.message : err,
    );
  }
}
