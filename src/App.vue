<template>
  <div id="app">
    <v-app>
      <v-content>
        <SeparatedArea />
      </v-content>
    </v-app>
  </div>
</template>

<script>
import SeparatedArea from "./components/SeparatedArea";

export default {
  name: "App",

  components: {
    SeparatedArea
  },

  data: () => ({
    //
  })
};
</script>
