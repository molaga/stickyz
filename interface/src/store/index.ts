import Vue from 'vue';
import Vuex from 'vuex';

import event from './event';
import user from './user';

Vue.use(Vuex)

export default new Vuex.Store<any>({
    modules: {
        event,
        user
    }
})