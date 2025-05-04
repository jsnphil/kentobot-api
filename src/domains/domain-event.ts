export type KentobotDomainEvent = {
  /**
   * A descriptive event type name that consumers use to react to this event.
   * Example: "viewer-subscribed", "stream-went-online"
   */
  type: string;

  /**
   * ISO 8601 timestamp representing when the event occurred.
   * This is separate from when the event was published or received.
   */
  occurredAt: string;

  /**
   * The system or domain that originated this event.
   * Example: "twitch", "song-queue", "stream"
   */
  source: 'twitch' | 'stream' | 'song-queue';

  /**
   * A version number for the schema of this event.
   * Used to support future migrations and evolution of the event format.
   */
  version: number;

  /**
   * The payload contains event-specific data.
   * The shape of this object depends on the event `type`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
};

/**
 * Helper function to create a domain event using the standard format.
 *
 * @param type - The event type string (e.g. "viewer-subscribed")
 * @param source - Where the event came from (e.g. "twitch")
 * @param payload - Structured payload for the event
 * @param occurredAt - Optional ISO string; defaults to current time
 * @param version - Optional schema version; defaults to 1
 * @returns A fully structured Kentobot domain event
 */
export function createDomainEvent(
  type: string,
  source: KentobotDomainEvent['source'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
  occurredAt: string = new Date().toISOString(),
  version = 1
): KentobotDomainEvent {
  return {
    type,
    source,
    payload,
    occurredAt,
    version
  };
}
