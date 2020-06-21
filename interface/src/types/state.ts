import { Event } from './event';

export interface State {
    events: Event[],
    upcomingEvents: Event[],
    activeEvents: Event[],
    notifiedEvents: Set<Event['id']>;
}