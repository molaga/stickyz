import moment from 'moment';
import { ActionContext } from 'vuex/types'
import { State } from '@/types/state';
import { Action } from '@/enums/actions';
import { Notify } from "@/helpers/audio";

const state: State = {
    events: [],
    upcomingEvents: [],
    activeEvents: [],
    notifiedEvents: new Set()
}

const getters = {
    events: ({ events }: State) => events,
    upcomingEvents: ({ upcomingEvents }: State) => upcomingEvents,
    activeEvents: ({ activeEvents }: State) => activeEvents,
    notifiedEvents: ({ notifiedEvents }: State) => notifiedEvents,
}

const actions = {
    updateEvents: ({ commit }: ActionContext<State, State>, events: State['events']) => commit(Action.UPDATE_EVENTS, events),
    syncEventsStatus: ({ commit }: ActionContext<State, State>) => {
        const now = moment();
        const upcoming = [];
        const active = [];
        const notified = new Set();
        let notify = false;

        for (const event of state.events) {
            const eventStart = moment(event.start);
            const eventEnd = moment(event.end);
            if (now.isBefore(eventStart) && eventStart.diff(now, 'minutes') < 10) upcoming.push(event);
            if (now.isBetween(eventStart, eventEnd)) active.push(event);
            if (now.isBefore(eventStart) && (eventStart.diff(now, 'minutes') < 1) && !state.notifiedEvents.has(event.id)) {
                notified.add(event.id)
                notify = true;
            }
            if (state.notifiedEvents.has(event.id)) notified.add(event.id)

        }

        if (notify) {
            Notify();
            setTimeout(() => { Notify(); }, 3000);
        }
        commit(Action.UPDATE_EVENTS_STATUS, { upcomingEvents: upcoming, activeEvents: active, notifiedEvents: notified })
    }
}

const mutations = {
    [Action.UPDATE_EVENTS]: (currState: State, events: State['events']) => currState.events = events,
    [Action.UPDATE_EVENTS_STATUS]: (currState: State, newState: State) => {
        currState.upcomingEvents = newState.upcomingEvents
        currState.activeEvents = newState.activeEvents
        currState.notifiedEvents = newState.notifiedEvents
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}