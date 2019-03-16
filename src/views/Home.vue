<template>
  <v-container class="home">
    <v-layout row align-center>
      <span>Комнаты</span>
      <v-btn flat icon color="primary" @click="reloadRooms()">
        <v-icon>refresh</v-icon>
      </v-btn>  
    </v-layout>
    
    <Rooms ref="rooms"/>
    <Games v-on:rooms-changed="roomsChanged()" />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Games from '@/components/Games.vue';
import Rooms from '@/components/Rooms.vue';

@Component({
  components: {
    Games,
    Rooms,
  },
})
export default class Home extends Vue {
  
  roomsChanged() {
    console.log("on: roomsChanged!");
    this.reloadRooms();
  }


  reloadRooms() {
    (this.$refs.rooms as Rooms).loadRooms();
  }
}
</script>
