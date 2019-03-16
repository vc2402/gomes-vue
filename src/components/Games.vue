<template>
  
  <div class="games">
    <v-snackbar
      v-model="sbText"
      bottom
      :timeout="sbTimeout"
    >
      {{sbText}}
      <v-btn
        color="accent"
        flat
        @click="sbText = ''"
      >
        ОК
      </v-btn>
    </v-snackbar>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn color="primary" fab dark fixed bottom right v-on:click="newRoom()" v-on="on"><v-icon>add</v-icon></v-btn>
      </template>
      <span>Создать новую комнату</span>
    </v-tooltip>
    
    <v-bottom-sheet v-model="showSheet">
      <v-card>
        <v-card-title primary-title>
          <div class="card-title">
            <h2>Создать новую комнату</h2>
            <span>Задайте параметры новой комнаты</span>
          </div>
        </v-card-title>
        
        <v-card-text>
          <v-radio-group class="no-margin" v-model="selectedGame" label="Выберите игру">
            <v-layout row wrap>
              <v-flex v-for="g in games" :key="g.id">
                <v-radio :label="g.name" :value="g"></v-radio>
              </v-flex>
            </v-layout>
          </v-radio-group>
          <v-text-field class="no-margin" label="Введите название комнаты" v-model="newRoomName"></v-text-field>          
        </v-card-text>
        <v-card-actions>
          <v-btn outline color="primary" dark @click="createRoom()">Создать</v-btn>      
          <v-btn outline color="primary" dark @click="showSheet = false">Закрыть</v-btn>      
        </v-card-actions>
      </v-card>
      
      

    
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Inject } from 'vue-property-decorator';
import VueApollo from 'vue-apollo';
import gql from 'graphql-tag';
import { LoginManager, LoginEvent } from '../plugins/loginManager';
import VueRx from 'vue-rx'

const LIST_GAMES_QUERY = gql`
  query ListGamesQuery {
    listGames {
      id
      name
    }
}`;

const CREATE_ROOM_MUTATION = gql`
    mutation createRoom($room: RoomInput!) {
      createRoom(room: $room) {
        id
    }
  }`;

@Component
export default class Games extends Vue {
  @Inject("loginManager") loginManager:LoginManager|undefined;
  private games: any[] = [];
  private showSheet: boolean = false;
  private selectedGame: any = null;
  private newRoomName: string = "";
  private sbTimeout: number = 2000;
  private sbText: string = "";
  // apollo: any = {rooms: {query:LIST_GAMES_QUERY}};
  public async loadGames() {
    this.$apollo.query( {
      query: LIST_GAMES_QUERY
    })
    .then( ({data, errors}) => {
      if( data ) { 
        this.games = data.listGames;
      } else {
        console.log("GamesQuery: error: ", errors);
      }
    })
  }
  created() {
    // console.log("created!");
    if( this.loginManager ) {
      if( this.loginManager.loggedIn )
        this.loadGames();
      this.$subscribeTo(this.loginManager.eventSource,
        (event: LoginEvent) => {
          if( event && event.event == "logged-in" )
            this.loadGames();
      });
    }
  }
  protected newRoom() {
    // console.log("NewRoom");
    this.showSheet = true;
  }
  protected createRoom() {
    if( this.selectedGame && this.newRoomName ) {
      const roomInput = {name: this.newRoomName, gameID: this.selectedGame.id};
      this.$apollo.mutate( {
        mutation: CREATE_ROOM_MUTATION,
        variables: {room: roomInput},
        // update: (proxy) => {proxy.}
      })
      .then( ({errors}) => {
        if( errors ) {
          this.sbText = "Возникли проблемы при создании комнаты";
          console.log("CreateRoom: ", errors);
        } else {
          this.sbText = "Комната успешно создана";
          this.showSheet = false;
          // this.emitRoomsChanged();
          this.$emit('rooms-changed')
          // this.$apollo.
        }
      })
    }
  }

  // @Emit('rooms-changed')
  // emitRoomsChanged() {
  //   console.log("emitting roomsChanged event");
    
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.games {
  text-align: start;
  font-size: 110%;
}
.card-title {
  span {
    font-size: 80%;
  }
}
.no-margin {
  margin-top: 0;
  padding: 0;
}
</style>
