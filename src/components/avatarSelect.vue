<template>
  <v-select
        v-model="selected"
        :items="items"
        box
        label="аватар"
        return-object
      >
      <template v-slot:selection="data">
        <v-avatar>
          <img :src="data.item.src">
        </v-avatar>
      </template>
      <template v-slot:item="data">
        <template>
          <v-list-tile-avatar>
            <img :src="data.item.src">
          </v-list-tile-avatar>
        </template>
      </template>
  </v-select>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Watch, Emit } from 'vue-property-decorator';
import VueApollo from 'vue-apollo';
import gql from 'graphql-tag';
import Router from 'vue-router';
import { LoginManager, LoginEvent } from '../plugins/loginManager';
import VueRx from 'vue-rx'
import {Avatars} from '../etc/avatars';

type avatar = {id:string, src: string}
@Component
export default class AvatarSelect extends Vue {
  @Prop() value: string|number|undefined;
  selected: avatar|null = null;
  items: avatar[] = [];
  created() {
    this.items = [];
    for( let id in Avatars ) {
      if( id != "0" )
      this.items.push({id, src: Avatars[id]})
    }
    if( this.value ) {
      this.selected = this.items.find( i => i.id == this.value)
    }
  }
  @Watch("selected")
  @Emit("input")
  onChanged() {
    return this.selected ? this.selected.id : "";
  }
  
}
</script>