import { ActionContext } from 'vuex/types'
import { Action } from '@/enums/actions';
import { User } from '@/types/user';

declare const gapi: any;

const state: User = {
    isLogged: false,
    profile: {},
    tokens: {},
    ...(window.localStorage['user.state'] ? JSON.parse(window.localStorage['user.state']) : {})
}

const getters = {
    profile: ({ profile }: User) => profile,
    tokens: ({ tokens }: User) => tokens,
    isLogged: ({ isLogged }: User) => isLogged
}

const actions = {
    updateUserState: ({ commit }: ActionContext<User, User>, newUserState: User) => {
        commit(Action.UPDATE_USER_STATE, newUserState)
        window.localStorage.setItem('user.state', JSON.stringify(state));
    }
}

const mutations = {
    [Action.UPDATE_USER_STATE]: (currState: User, newState: User) => {
        currState.isLogged = newState.isLogged;
        currState.tokens = newState.tokens;
        currState.profile = newState.profile;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}