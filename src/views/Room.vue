<template>
  <v-container class="room" align-content-start>
    <v-layout v-if="room != null" column>
      <v-layout row wrap>
        <v-layout column>
          <v-flex  class="room-name">{{room.name}}</v-flex>
          <v-flex  class="game-name">{{room.game.name}}</v-flex>  
        </v-layout>
        <v-flex class="game-state">{{room.state}}</v-flex>
        <v-flex>Количество участников: {{room.players.length}}</v-flex>
        <v-btn v-if="room.owner.id === loginManager.user.id" color="success">Передать</v-btn>
      </v-layout>
      <v-btn v-if="room.you === null && room.state == 'COLLECTING'" color="success" @click="joinRoom()">Присоединиться</v-btn>
      <v-layout row wrap v-if="room.players.length">
        <v-flex lg12>
          Участники
        </v-flex>
        <v-chip
          v-for="pl in room.players"
          close
          @input="remove(pl.player)"
          :color="room.you == pl.index ? 'primary':pl.status == 'NEW' ? '':'success'"
        >
          <v-avatar>
            <img :src="getAvatar(pl.player)">
          </v-avatar>
          {{ pl.player.name }}
        </v-chip>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import VueApollo from 'vue-apollo';
import gql from 'graphql-tag';
import Route from 'vue-router';
import { LoginManager, LoginEvent } from '../plugins/loginManager';
import VueRx from 'vue-rx'
import {Avatars} from '../etc/avatars';


const LIST_ROOM_QUERY = gql`
  query GetRoomQuery($id: ID!) {
    getRoom(id: $id) {
      id
      name
      you
      state
      phase
      round
      owner {
        id
      }
      game { 
        id
        name 
      },
      players { 
        player { 
          id
          name
          avatar
        }
        status
        index
      }
      actions 
      params {
        name
        value
      }
    }
}`;
const JOIN_ROOM_MUTATION = gql`
    mutation joinRoom($roomID: ID!, $name: String!) {
      joinRoom(roomID: $roomID, name: $name) {
        player {
          id
          name
        }
        status
    }
  }`; 
@Component
export default class Room extends Vue {
  @Inject("loginManager") loginManager:LoginManager|undefined;
  id: string = "";
  room: any = null;
  playerID: string = "";
  loadRoom() {
    if( !this.id )
      return;
    console.log("Loading room with id ", this.id);
    
    this.$apollo.query( {
      query: LIST_ROOM_QUERY,
      fetchPolicy: "network-only",
      variables: {id: this.id}
    })
    .then( ({data, errors}) => {
      console.log("loadRoom: ", {data,errors});
      if( data ) {
        this.room = data.getRoom;
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
  async joinRoom() {
    if( this.room ) {
      try {
        let res = await this.$apollo.mutate({
          mutation: JOIN_ROOM_MUTATION,
          variables: {roomID: this.id, name: this.loginManager!.user!.name}
        });
        let data = <any>res.data
        console.log( "joinRoom: result: ", data );
        if( data.joinRoom.player.id ) {
          this.playerID = data.joinRoom.id;
          this.loadRoom();
        }
      } catch( exc ) {
        console.log("joinRoom: exception: ", exc);
        
      }
    }
  }
  getAvatar(pl: any) {
    if(pl.avatar)
      return Avatars[pl.avatar]
    else
      return Avatars["0"]
  }
  remove(pl: any) {
    let idx = this.room.players.findIndex(p => p.player.id == pl.id);
    if( idx >= 0 )
      this.room.players.splice(idx, 1)
  }
  created() {
    // console.log("created!");
    this.id = this.$route.params.id;
    if( this.loginManager ) {
      if( this.loginManager.loggedIn )
        this.loadRoom();
      this.$subscribeTo(this.loginManager.eventSource,
        (event: LoginEvent) => {
          if( event && event.event == "logged-in" )
            this.loadRoom();
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.room {
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
