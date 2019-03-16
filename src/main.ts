import Vue from 'vue';
import './plugins/vuetify'
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo from 'vue-apollo';
import VueRx from 'vue-rx'

import {GetBaseURL} from './plugins/loginManager';

Vue.config.productionTip = false;

const httpLink = new HttpLink({
  // You should use an absolute URL here
  // uri: 'http://vc24.mooo.com:8086/api/query',
  // uri: 'http://localhost:8086/api/query',
  uri: GetBaseURL,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loading'
  }
})

Vue.use(VueRx)

new Vue({
  router,
  store,
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app');
