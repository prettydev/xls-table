<template>
  <div id="app">
    <Header />
    <DropZone />
    <CSVArea />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import DropZone from "./components/DropZone.vue";
import CSVArea from "./components/CSVArea";
export default {
  name: "App",
  components: {
    Header,
    DropZone,
    CSVArea
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
