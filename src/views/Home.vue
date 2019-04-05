<template>
  <v-container class="home">
    <v-layout row align-center justify-space-between>
      <v-flex>Комнаты</v-flex>
      <v-switch v-if="admin" label="Показать все" v-model="showAllRooms"></v-switch>
      <v-btn flat icon color="primary" @click="reloadRooms()">
        <v-icon>refresh</v-icon>
      </v-btn>  
    </v-layout>
    
    <Rooms ref="rooms" :showAll="showAllRooms"/>
    <Games v-on:rooms-changed="roomsChanged()" />
    <UserSearch/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator';
import Games from '@/components/Games.vue';
import Rooms from '@/components/Rooms.vue';
import UserSearch from '@/components/userSearchComponent.vue';
import { LoginManager, LoginEvent } from '../plugins/loginManager';

@Component({
  components: {
    Games,
    Rooms,
    UserSearch,
  },
})
export default class Home extends Vue {
  @Inject("loginManager") loginManager:LoginManager|undefined;
  showAllRooms: boolean = false;
  admin: boolean = false;
  created() {
    this.$subscribeTo(this.loginManager!.eventSource, (ev:LoginEvent) => {
      if(ev && ev.event == "logged-in") {
        this.admin = this.loginManager!.user!.roles.some( r => r == "admin")
      }
      
    });
  }

  roomsChanged() {
    console.log("on: roomsChanged!");
    this.reloadRooms();
  }


  reloadRooms() {
    (this.$refs.rooms as Rooms).loadRooms();
  }
}
</script>
