<template>
  <div id="data-table" class="data-table">
    <table>
      <tbody>
        <th>name</th>
        <th>email</th>
        <th>age</th>
        <tr v-for="item in locations" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.age }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: "DataTable",
  props: {
    locations: Array
  }
};
</script>
<style>
.data-table {
  margin-top: 200px;
  margin-left: 100px;
  max-width: 680px;
  background: #eee;
}
</style>