<template>
  <div class="drop-area" id="drop-area">
    <div class="p-12 border">
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
      <div id="json"></div>
      <input
        type="file"
        name="fields[assetsFieldHandle][]"
        id="assetsFieldHandle"
        class="w-px h-px opacity-0 overflow-hidden absolute"
        @change="onChange"
        ref="file"
        accept=".xls, .xlsx, .csv"
      />

      <div
        class="drop-rect"
        @dragover="dragover"
        @dragleave="dragleave"
        @drop="drop"
      >Drop here excel or csv file</div>
    </div>
  </div>
</template>
<script>
import XLSX from "xlsx";
export default {
  name: "DropArea",
  delimiters: ["${", "}"], // Avoid Twig conflicts
  data: function() {
    return {
      file: {}, // Store our uploaded files
      locations: [
        {
          id: 1,
          name: "Richard Hendricks",
          email: "richard@piedpiper.com",
          age: 25
        },
        {
          id: 2,
          name: "Bertram Gilfoyle",
          email: "gilfoyle@piedpiper.com",
          age: 27
        },
        {
          id: 3,
          name: "Dinesh Chugtai",
          email: "dinesh@piedpiper.com",
          age: 28
        }
      ]
    };
  },
  methods: {
    onChange() {
      this.file = this.$refs.file.files[0];
      var reader = new FileReader();
      reader.onload = async function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        let sheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[sheetName];
        this.locations = await XLSX.utils.sheet_to_json(worksheet);
      };
      reader.readAsArrayBuffer(this.file);
    },
    dragover(event) {
      event.preventDefault();
      if (!document.querySelector(".drop-rect").style.background !== "#aaa") {
        document.querySelector(".drop-rect").style.background = "#aaa";
      }
    },
    dragleave(event) {
      event.preventDefault();
      document.querySelector(".drop-rect").style.background = "green";
    },
    drop(event) {
      event.preventDefault();
      this.$refs.file.files = event.dataTransfer.files;
      this.onChange();

      document.querySelector(".drop-rect").style.background = "#aaa";
    }
  }
};
</script>
<style>
[v-cloak] {
  display: none;
}
.drop-area {
  margin-top: 200px;
  margin-left: 100px;
  max-width: 680px;
  background: #0aa;
}
.drop-rect {
  height: 200px;
  background: #aa0;
}
.bg-gray-100 {
  background: #369;
}
.bg-gray-300 {
  background: #963;
}
</style>
