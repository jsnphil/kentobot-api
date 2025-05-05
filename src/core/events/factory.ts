// /src/core/events/factory.ts

import { KentobotDomainEvent } from '@domains/domain-event';
import { TSource, TType } from './../types/event-types';

export function createDomainEvent<TPayload>(
  type: TType,
  source: TSource,
  version: number,
  payload: TPayload
): KentobotDomainEvent<TPayload> & {
  type: string;
  source: string;
  version: number;
} {
  return {
    type,
    source,
    version,
    occurredAt: new Date().toISOString(),
    payload
  };
}
