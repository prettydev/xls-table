import Vue from 'vue';
import App from './App.vue';

import VueXlsx from 'vue-js-xlsx';

Vue.use(VueXlsx);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App)
}).$mount('#app');
