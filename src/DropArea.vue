<template>
  <div class="drop-area" id="drop-area">
    <div class="p-12 border">
      <table>
        <tbody>
          <th>name</th>
          <th>age</th>
          <th>job</th>
          <tr v-for="(item, key) in locations" :key="key">
            <td>{{ item.name }}</td>
            <td>{{ item.age }}</td>
            <td>{{ item.job }}</td>
          </tr>
        </tbody>
      </table>
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
      >
        Drop here excel or csv file
      </div>

      <textarea @paste="onPaste" @blur="onBlur"></textarea>
    </div>
  </div>
</template>
<script>
import XLSX from "xlsx";
import csv2json from "csvjson-csv2json";
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
          job: "richard@piedpiper.com",
          age: 25,
        },
        {
          id: 2,
          name: "Bertram Gilfoyle",
          job: "gilfoyle@piedpiper.com",
          age: 27,
        },
        {
          id: 3,
          name: "Dinesh Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28,
        },
      ],
    };
  },
  methods: {
    onChange() {
      this.file = this.$refs.file.files[0];
      let self = this;
      var reader = new FileReader();
      reader.onload = async function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        let sheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[sheetName];
        self.locations = await XLSX.utils.sheet_to_json(worksheet);
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
      document.querySelector(".drop-rect").style.background = "#eee";
    },
    drop(event) {
      event.preventDefault();
      this.$refs.file.files = event.dataTransfer.files;
      this.onChange();

      document.querySelector(".drop-rect").style.background = "#aaa";
    },
    onPaste(event) {
      console.log("on paste", event);
    },
    onBlur(event) {
      this.locations = csv2json(event.target.value, { parseNumbers: true });
    },
  },
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
  background: #eee;
}
.bg-gray-100 {
  background: #369;
}
.bg-gray-300 {
  background: #963;
}
</style>
