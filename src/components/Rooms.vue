<template>
  <v-container class="rooms" align-content-start>
    <v-layout row v-for="r in rooms" v-bind:key="r.id">
      <v-flex sm8 md6 lg4>
        <v-layout column>
          <v-flex  class="room-name">{{r.name}}</v-flex>
          <v-flex  class="game-name">{{r.game.name}}</v-flex>  
        </v-layout>
      </v-flex>  
      <v-flex  sm4 md3 lg2 class="game-state">{{r.state}}</v-flex>
      <v-spacer></v-spacer>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import VueApollo from 'vue-apollo';
import gql from 'graphql-tag';
import { LoginManager, LoginEvent } from '../plugins/loginManager';
import VueRx from 'vue-rx'

const LIST_ROOMS_QUERY = gql`
  query ListRoomsQuery {
    listRooms {
      id
      name
      game {
        name
      }
      players {
        player {
          name
        }
        status
      }
      state
    }
}`;

@Component
export default class Rooms extends Vue {
  @Inject("loginManager") loginManager:LoginManager|undefined;
  rooms: any[] = [];
  loadRooms() {
    this.$apollo.query( {
      query: LIST_ROOMS_QUERY,
      fetchPolicy: "network-only",
    })
    .then( ({data, errors}) => {
      if( data ) {
        this.rooms = data.listRooms;
      } else {
        console.log("Query: error: ", errors);
      }
    })
    .catch(err => {
      if( err.message && err.message.indexOf("401") != -1 ) {
        console.log("not logged in!")
      } else {
        console.log("Exception was caught: ", err);
      }
    })
  }
  created() {
    // console.log("created!");
    if( this.loginManager ) {
      if( this.loginManager.loggedIn )
        this.loadRooms();
      this.$subscribeTo(this.loginManager.eventSource,
        (event: LoginEvent) => {
          if( event && event.event == "logged-in" )
            this.loadRooms();
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.rooms {
  padding: 4px 0 0;
  margin-left: 24px;
}
.game-name {
  font-size: 80%;
}
.room-name {
  font-weight: 700;
  font-size: 120%;
}
.game-state {
  font-size: 90%;
  font-style: italic;
}
</style>
