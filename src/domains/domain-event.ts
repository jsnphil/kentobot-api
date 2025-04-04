export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly eventType: string;

  protected constructor(eventType: string) {
    this.occurredAt = new Date();
    this.eventType = eventType;
  }

  /* istanbul ignore next */
  public toJSON(): Record<string, any> {
    return {
      occurredAt: this.occurredAt.toISOString(),
      eventType: this.eventType,
      ...this.serialize()
    };
  }

  protected abstract serialize(): Record<string, any>;
}
