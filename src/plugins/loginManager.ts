import axios from 'axios'
import {Observable, Subscriber, Subject} from 'rxjs';

export function GetBaseURL() { return BaseURL + "/api/query"; }
export var BaseURL: string = "http://localhost:8086";
export type LoginEventKind = "logged-in"|"logged-out"|"modified";
export interface LoginEvent {
  event: LoginEventKind;
}
export interface UserProperties {
  name?: string;
  login?: string;
  password?: string;
}
export interface User {
  id: string;
  name: string;
  login: string;
  created: number;
  modified: number;
  roles: string[];
}
export class LoginManager {
  eventSource: Subject<LoginEvent> = new Subject();
  loggedIn: boolean = false;
  token: string|null = null;
  user: User|undefined;
  start(path: string) {
    this.token = localStorage.getItem("token");
    if(window.location.host != "localhost:8080") {
      let url = window.location.href;
      console.log("getting base url: ", url, path);
      let idx = url.lastIndexOf(path);
      if( idx != -1 ) {
        BaseURL = url.substring(0,idx);
      }
    }
    this.validateLogin();
  }
  async login(username: string, password: string) {
    try {
      let res = await axios.post(BaseURL + "/api/user/login",
        {username, password}
      );
      if( res.status == 200 && res.data.token ) {
        this.token = res.data.token;
        this.validateLogin();
        return true;
      } else {
        this.token = null;
        localStorage.removeItem("token");
        console.log("login: result: ", res);
        return false;
      }
    } catch( exc ) {
      this.token = null;
      localStorage.removeItem("token");
      console.log("login: exception: ", exc);
      return false;
    }
  }
  async validateLogin() {
      try {
        let me = await this.me();
        if( me ) {
          this.loggedIn = true;
          localStorage.setItem('token', this.token!);
          console.log("login: success: ", this.token);
          this.eventSource.next({event:"logged-in"});
          return true;
        }
      } catch( exc ) {

      }
     
    if(this.loggedIn)
      this.logout();
    return false;
  }

  async me(): Promise<User|undefined> {
    if( this.token ) {
      try {
        let me = await axios.get(BaseURL + "/api/user/me",
                {headers: {authorization: "Bearer " + this.token}} );
        if( me.data && me.data.player ) {
          this.user = me.data.player;
          return this.user;
        }
      } catch( exc ) {
        console.log("me: exception: ", exc);
        
      }
    }
    return undefined;
  }

  logout() {
    if(this.loggedIn) {
      this.loggedIn = false;
      localStorage.removeItem("token");
      this.user = undefined;
      this.eventSource.next({event:"logged-out"});
    }
  }

  async set( props: UserProperties ) {
    if( this.token ) {
      // console.log("set: ", props);
      try {
        let res = await axios.post(BaseURL + "/api/user/me",
          props,
          {headers: {authorization: "Bearer " + this.token}}
        );
        if( res.status == 200 ) {
          await this.me();
          this.eventSource.next({event:"modified"});
          return true;
        } else {
          console.log("set: result: ", res);
          return false;
        }
      } catch( exc ) {
        console.log("set: exception: ", exc);
        return false;
      }
    } else {
      throw "unathorised";
    }
  }
}