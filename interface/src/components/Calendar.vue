<template>
  <v-container style="padding: 0">
    <v-row class="text-center">
      <v-col cols="12">
        <v-sheet height="20">
          <v-calendar
                  ref="calendar"
                  v-model="value"
                  type="day"
                  :events="events"
                  event-overlap-mode="stack"
                  :event-overlap-threshold="15"
                  color="primary"
          >
            <template #day-body="{ date, week }">
              <div
                      class="v-current-time"
                      :class="{ first: date === week[0].date }"
                      :style="{ top: nowY }"
              ></div>
            </template>
          </v-calendar>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from "vue-class-component";
  import {mapActions, mapGetters} from "vuex";

  @Component({
      methods: mapActions(['syncEventsStatus']),
      computed: mapGetters(['events', 'activeEvents', 'upcomingEvents', 'notifiedEvents'])
  })
  export default class Calendar extends Vue {
    nowY = '-10px';
    value = '';
    syncTimeout: any;
    syncEventsStatus!: () => any

    syncData (): void {
        const cal: any = this.$refs.calendar;
        if (cal.updateTimes) cal.updateTimes()

        this.nowY = (cal ? cal.timeToY(cal.times.now) + 'px' : '-10px')

        if (cal.scrollToTime) cal.scrollToTime(cal.times.now)

        this.syncEventsStatus();



        this.syncTimeout = setTimeout(() => {
            this.syncData();
        }, 800);
    }

    mounted () {
        this.syncData();
    }
  }
</script>

<style lang="scss">
  .v-calendar {
    -webkit-user-select: none;
    -webkit-app-region: drag;

    .v-calendar-daily__intervals-body {
      display: none;
    }
  }

  .container {
    position: relative;
    padding: 0;

    .col {
      padding: 0;
    }
  }
  .top_gradient, .bottom_gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 25px;
    background: linear-gradient(180deg, white, transparent);
    content: '';
    z-index: 1;
  }

  .bottom_gradient {
    top: initial;
    bottom: 0;
    background: linear-gradient(0deg, white, transparent);
  }

  .v-current-time {
    height: 2px;
    background-color: #ea4335;
    position: absolute;
    left: -1px;
    right: 0;
    pointer-events: none;

    &.first::before {
      content: '';
      position: absolute;
      background-color: #ea4335;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: -5px;
      margin-left: -6.5px;
    }
  }
  .v-calendar-daily_head-day {
    display: none;
  }
</style>