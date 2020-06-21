export interface Event {
    [key: string]: unknown;
    id: string;
    name: string;
    start: Date,
    end: Date,
    timed: boolean;
    location?: string;
    conferenceLink?: string;
}