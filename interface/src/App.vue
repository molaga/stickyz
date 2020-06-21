<template>
  <v-app>
    <v-container v-if="isLogged">
      <v-row>
        <v-col class="recent_events" cols="8">
          <ul>
<!--            <li>Upcoming</li>-->
            <li v-for="event of upcomingEvents.slice(0,2)" :key="event.id">
              <div>UP | {{ event.name }}</div>
              <a v-if="event.conferenceLink" :href="event.conferenceLink" @click.prevent="openLink(event.conferenceLink)">Join</a>
            </li>
            <li v-if="!upcomingEvents.length">- No upcoming -</li>
          </ul>
          <ul>
<!--            <li>Active</li>-->
            <li v-for="event of activeEvents.slice(0,2)" :key="event.id">
              <div>AC | {{ event.name }}</div>
              <a v-if="event.conferenceLink" :href="event.conferenceLink" @click.prevent="openLink(event.conferenceLink)">Join</a>
            </li>
            <li v-if="!activeEvents.length">- No active -</li>
          </ul>
        </v-col>
        <v-col cols="4">
          <Calendar v-if="isLogged" />
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <h2 @click="login">login</h2>
      <input type="text" v-model="userToken" @keyup.enter.prevent="registerToken" />
    </v-container>
    <!-- <router-view></router-view> -->
  </v-app>
</template>
<script lang="ts">
  import Vue from 'vue'
  import moment from 'moment';
  import Component from 'vue-class-component'
  import { OAuth2Client } from "google-auth-library"
  import { mapGetters, mapActions } from 'vuex'
  import keys from '../app_key.json';
  import { Endpoint } from "@/enums/google";
  import { Event } from "@/types/event";
  import Calendar from "@/components/Calendar.vue";
  const { remote } = window.require('electron');

  @Component({
      components: { Calendar },
      computed: mapGetters(['events', 'tokens', 'profile', 'isLogged', 'upcomingEvents', 'activeEvents']),
      methods: mapActions(['updateUserState', 'updateEvents'])
  })
  export default class MyComponent extends Vue {
      updateUserState!: (...args: any) => any;
      updateEvents!: (...args: any) => any;
      profile!: any;
      tokens!: any;

      userToken = '';
      oauthClient: OAuth2Client = new OAuth2Client(
          keys.installed.client_id,
          keys.installed.client_secret,
          keys.installed.redirect_uris[0]
      )

      mounted (): void {
          // @ts-ignore
          window.oauth = this.oauthClient;

          if (this.tokens && Object.keys(this.tokens).length) {
              this.oauthClient.setCredentials(this.tokens);
              this.fetchEvents();
          }
      }

      async fetchEvents (): Promise<void> {
          try {
              const params = {
                  timeMin: moment().startOf('day').toISOString(),
                  timeMax: moment().endOf('day').toISOString()
              }
              let events = await this.oauthClient.request({
                  url: Endpoint.CALENDAR_EVENTS.replace('calendarId', this.profile.email),
                  params
              }) as any;

              events = events.data.items
                  .filter((event: any) => event.hasOwnProperty('start') && 'cancelled' !== event.status)
                  .map((event: any): Event => {
                      return {
                          id: event.id,
                          name: event.summary,
                          start: new Date(event.start.dateTime || event.start.date),
                          end: new Date(event.end.dateTime || event.end.date),
                          conferenceLink: event.hangoutLink || (/^http.*zoom/.test(event.location || '') ? event.location.split(',')[0] : null),
                          timed: event.start.hasOwnProperty('dateTime')
                      }
                  })
              this.updateEvents(events)


              setTimeout(() => {
                  this.fetchEvents()
              }, 1000 * 60) //  * 15
          } catch (e) {
              console.error(e.stack);
              this.updateUserState({ isLogged: false, tokens: {}, profile: {} });
          }
      }

      login (): void {
          const authorizeUrl = this.oauthClient.generateAuthUrl({
              access_type: 'offline',
              scope: [
                  'https://www.googleapis.com/auth/userinfo.profile',
                  'https://www.googleapis.com/auth/userinfo.email',
                  'https://www.googleapis.com/auth/calendar.readonly',
                  'https://www.googleapis.com/auth/calendar.events.readonly',
              ],
          });

          console.log(authorizeUrl);
          // window.open(authorizeUrl);
          this.openLink(authorizeUrl);
      }

      openLink (url: string): void {
          remote.shell.openExternal(url);
      }

      async registerToken (evt: any): Promise<void> {
          const token = evt.target.value;
          const r = await this.oauthClient.getToken(token);
          this.oauthClient.setCredentials(r.tokens);

          const userProfile = await this.oauthClient.request({ url: Endpoint.USER_INFO });
          this.updateUserState({
              isLogged: true,
              tokens: r.tokens,
              profile: userProfile.data
          });
          this.fetchEvents();
      }
  }
</script>

<style lang="scss" scoped>
  .recent_events {
    display: flex;
    ul {
      flex: 0 0 calc(50% - 8px);
      list-style: none;
      white-space: nowrap;
      padding-left: 14px;

      li {
        display: flex;
        justify-content: space-between;
        font-size: 9px;

        > * {
          flex: 0 0 auto;
          overflow: hidden;
          text-overflow: ellipsis;

          &:first-child {
            max-width: 85px;
          }
        }

        /*&:first-child {*/
        /*  color: grey;*/
        /*}*/
      }
    }
  }
  .container {
    max-width: 100%;
    padding: 0;
  }
</style>