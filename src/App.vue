<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Gomes</span>
        <span class="font-weight-light">(Vue client)</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      {{name}}
      <v-tooltip v-if="name" bottom>
        <template v-slot:activator="{ on }">
          <v-btn flat icon color="primary" @click="changeUserInfo()" v-on="on">
            <v-icon>person</v-icon>
          </v-btn>
        </template>
        <span>Посмотреть свои параметры</span>
      </v-tooltip>
      <v-tooltip  v-if="name" bottom>
        <template v-slot:activator="{ on }">
          <v-btn flat icon color="primary" @click="logout()" v-on="on">
            <v-icon>exit_to_app</v-icon>
          </v-btn>
        </template>
        <span>Хлопнуть дверью</span>
      </v-tooltip>
    </v-toolbar>
    <v-dialog
      v-model="showLoginDialog"
      width="500"
      persistent
    >
      <form>
        <v-card @keydown:enter="login()">
          <v-card-title
            class="headline lighten-2"
            primary-title
          >
            Войдите, а то не сможете хлопнуть дверью
          </v-card-title>

          <v-card-text>
            Введите свои данные
            <v-layout column>
              <v-text-field
                label="логин"
                id="login"
                v-model="username"
              ></v-text-field>
              <v-text-field
                label="пароль"
                id="password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                @click:append="() => (showPassword = !showPassword)"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
              ></v-text-field>
            </v-layout>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="login()"
            >
              Войти
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </form>    
    </v-dialog>
    <UserPreferencesDialog ref="userPrefs" />
    <!-- <v-content>
      <Home/>
    </v-content> -->
    <router-view></router-view>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator';
import { LoginManager, LoginEvent } from './plugins/loginManager';
import Home from './views/Home.vue';
// import gql from 'graphql-tag';
import VueRx from 'vue-rx'
import Router from 'vue-router';
import UserPreferencesDialog from './components/userPreferencesDialog.vue';

// const LOGIN_MUTATION = gql`
//   mutation Login($credentials: LoginInput) {
//     login(credentials: $credentials) {
//       token
//     }
// }`;

@Component({
  components: {
    Home,
    UserPreferencesDialog
  },
})
export default class App extends Vue {
  @Provide("loginManager") loginManager: LoginManager = new LoginManager();
  private showLoginDialog: boolean = true;
  private username: string = "";
  private password: string = "";
  private name: string = "";
  private showPassword: boolean = false;
  constructor() {
    super();
    
  }
  created() {
    this.loginManager.start(this.$router.currentRoute.path);
    this.$subscribeTo(this.loginManager.eventSource, (ev:LoginEvent) => {
      // console.log("loginManager event: ", ev);
      if( ev && ev.event == "modified") {
        this.name = this.loginManager.user!.name;
      } else
        this.loggedIn(ev && ev.event == "logged-in")
      
    });
    this.loggedIn( this.loginManager.loggedIn );
  }
  loggedIn(really: boolean) {
    if( really ) {
      this.showLoginDialog = false;
      this.name = this.loginManager.user!.name;
    } else {
      this.showLoginDialog = true;
      this.name = "";
    }
  }
  async login() {
    try {
    let res = await this.loginManager.login(this.username, this.password)
      // if( res )
      //   this.showLoginDialog = false
    } catch(exc) {
      console.log("Exception: ", exc);
      
    }
  }
  logout() {
    this.loginManager.logout();
  }
  changeUserInfo() {
    (this.$refs.userPrefs as UserPreferencesDialog).show();
  }
}
</script>
