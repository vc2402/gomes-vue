<template>
  <v-dialog
    v-model="showDialog"
    persistent
    :fullscreen="$vuetify.breakpoint.sm"
    :width="$vuetify.breakpoint.lgAndUp ? '60vw' : '80vw'"
  >
    <div class="progress" v-if="loading">
      <v-progress-circular 
        indeterminate
        size="48"
      >
      </v-progress-circular>
    </div>
    <form>
      <v-card >
        <v-card-title
          class="headline lighten-2"
          primary-title
        >
          Параметры пользователя
        </v-card-title>

        <v-card-text>
          <v-layout column>
            <v-layout row wrap justify-space-around>
              <v-flex sm12 md5 lg4>
                <v-text-field
                  label="логин"
                  v-model="login"
                ></v-text-field>
              </v-flex>
              <v-flex sm12 md5 lg4>
                <v-text-field
                  label="имя"
                  v-model="userName"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap justify-space-around>
              <v-flex sm12 md5 lg4>
                <v-text-field
                  label="пароль"
                  :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                  @click:append="() => (showPassword = !showPassword)"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                ></v-text-field>
              </v-flex>
              <v-flex sm12 md5 lg4>
                <v-text-field
                  label="повторите пароль"
                  :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                  @click:append="() => (showPassword = !showPassword)"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password2"
                  :rules="[() => password != password2 ? 'Пароли не совпадают':true]"
                ></v-text-field>
              </v-flex>
            </v-layout>
              {{problem}}
            <v-layout row wrap justify-space-around>
              <v-flex sm12 md5 lg4>
                Создан: {{createdOn|date}}
              </v-flex>
              <v-flex sm12 md5 lg4>
                Изменён: {{modifiedOn|date('dt')}}
              </v-flex>
            </v-layout>
          </v-layout>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="save()"
          >
            Сохранить
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="close()"
          >
            Закрыть
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </form> 
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Inject } from 'vue-property-decorator';
import VueApollo from 'vue-apollo';
import { LoginManager, LoginEvent, UserProperties } from '../plugins/loginManager';
import VueRx from 'vue-rx'
import { DateTimeFilter} from '../filters/dateTimeFilter';

@Component({
  filters: {
    date: DateTimeFilter,
  }
})
export default class UserPreferencesDialog extends Vue {
  @Inject("loginManager") loginManager:LoginManager|undefined;
  private login: string = "";
  private userName: string = "";
  private password: string = "";
  private password2: string = "";
  private createdOn: number = 0;
  private modifiedOn: number = 0;
  private showPassword: boolean = false;
  private loading: boolean = false;
  private showDialog: boolean = false;
  private problem: string = "";
  
  async save() {
    this.problem = "";
    if( this.password != this.password2 ) {
      this.problem = "Пароли не совпадают";
      return;
    }
    let up: UserProperties = {};
    let modified: boolean = false;
    if( this.userName && this.userName != this.loginManager.user.name ) {
      modified = true;
      up.name = this.userName;
    }
    if( this.login && this.login != this.loginManager.user.login ) {
      modified = true;
      up.login = this.login;
    }
    if( this.password ) {
      modified = true;
      up.password = this.password;
    }
    if( modified ) {
      this.loading = true;
      try {
        let res = await this.loginManager.set(up);
        if( !res ) {
          this.problem = "Произошла ошибка при сохранении изменений";
          return;
        }
      } catch(exc) {
        console.log("set: ", exc);
        this.problem = "Произошла ошибка при сохранении изменений";
        return;
      }
      this.loading = false;
    }
    this.showDialog = false;
  }
  close() {
    this.showDialog = false;
  }
  fill() {
    this.password = "";
    this.password2 = "";
    if( this.loginManager && this.loginManager.user ) {
      this.login = this.loginManager.user.login;
      this.userName = this.loginManager.user.name;
      this.createdOn = this.loginManager.user.created * 1000;
      this.modifiedOn = this.loginManager.user.modified * 1000;
    }
  }
  public show() {
    this.fill();
    this.showDialog = true;
  }
}
</script>

<style scoped lang="scss">
.progress {
  position: absolute;
  left: calc(50% - 24px);
  top: calc(50% - 24px);
  z-index: 1000;
}
</style>