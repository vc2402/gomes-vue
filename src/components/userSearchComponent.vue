<template>
  <v-autocomplete
        v-model="selected"
        :items="items"
        :loading="isLoading"
        :search-input.sync="search"
        color="white"
        box
        chips
        multiple
        no-filter
        no-data-text="Не найдено ни одного пользователя"
        :item-text="['login','name']"
        :item-value="['login','name']"
        label="Поиск пользователей"
        placeholder="Начните вводить логин"
        prepend-icon="mdi-database-search"
        return-object
      >
      <template v-slot:selection="data">
        <v-chip
          :selected="data.selected"
          close
          class="chip--select-multi"
          @input="remove(data.item)"
        >
          <v-avatar>
            <img :src="data.item.avatar">
          </v-avatar>
          {{ data.item.name }}
        </v-chip>
      </template>
      <template v-slot:item="data">
        <template v-if="typeof data.item !== 'object'">
          <v-list-tile-content v-text="data.item"></v-list-tile-content>
        </template>
        <template v-else>
          <v-list-tile-avatar>
            <img :src="data.item.avatar">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
            <v-list-tile-sub-title v-html="data.item.login"></v-list-tile-sub-title>
          </v-list-tile-content>
        </template>
      </template>
    </v-autocomplete>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Watch } from 'vue-property-decorator';
import VueApollo from 'vue-apollo';
import gql from 'graphql-tag';
import Router from 'vue-router';
import { LoginManager, LoginEvent } from '../plugins/loginManager';
import VueRx from 'vue-rx'
import {Avatars} from '../etc/avatars';

const LIST_PLAYERS_QUERY = gql`
  query ListPlayersQuery($startsWith: String) {
    listPlayers(startsWith: $startsWith) {
      id
      name
      login
    }
}`;

@Component
export default class UserSearch extends Vue {
  @Prop() selected: any[]|undefined;
  items: any[] = [];
  search: any = null;
  isLoading: boolean = false;
  timer: any = null;

 @Watch("search")
  onSearch() {
    // console.log("search: ", search);
    if( this.timer )
      clearTimeout(this.timer)
    this.timer = setTimeout(() => {this.searchUsers(); this.timer = null;}, 200);
  }

  searchUsers() {
    this.isLoading = true;
    this.$apollo.query( {
      query: LIST_PLAYERS_QUERY,
      fetchPolicy: "network-only",
      variables: {startsWith: this.search}
    })
    .then( ({data, errors}) => {
      this.isLoading = false;
      if( data ) {
        this.items = data.listPlayers;
        this.items.forEach( i => i.avatar = 
        i.login == 'gad' ? Avatars[16] : Avatars[1]
        // "/public/img/avatars/1.png"
        )
      } else {
        console.log("Query: error: ", errors);
      }
    })
    .catch(err => {
      this.isLoading = false;
      if( err.message && err.message.indexOf("401") != -1 ) {
        console.log("not logged in!")
      } else {
        console.log("Exception was caught: ", err);
      }
    })
    
  }
  remove (item: any) {
    console.log("remove: ", item);
    
    const index = this.selected.findIndex(i => item.id == i.id)
    if (index >= 0) this.selected.splice(index, 1)
  }
}
</script>