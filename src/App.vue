<template>
  <div id="app">
    <DropArea />
  </div>
</template>

<script>
import DropArea from "./DropArea";

export default {
  name: "App",
  components: {
    DropArea,
  },
  data() {
    return {};
  },
};
</script>

<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
