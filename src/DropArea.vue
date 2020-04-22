<template>
  <div id="drop-area">
    <h1>Paste your location data below to map it:</h1>
    <div class="common table-div">
      <table class="data-table">
        <tbody>
          <th>name</th>
          <th>age</th>
          <th>job</th>
          <tr v-for="(item, key) in json_array" :key="key">
            <td>{{ item.name }}</td>
            <td>{{ item.age }}</td>
            <td>{{ item.job }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="drop-rect common"
      @dragover="dragover"
      @dragleave="dragleave"
      @drop="drop"
    >
      Drop here excel or csv file
    </div>
    <div class="common">
      <textarea
        class="csv-area"
        @paste="onPaste"
        @blur="onBlur"
        v-model="csv_data"
      ></textarea>
    </div>

    <input
      type="file"
      name="fields[assetsFieldHandle][]"
      id="assetsFieldHandle"
      class="w-px h-px opacity-0 overflow-hidden absolute"
      @change="onChange"
      ref="file"
      accept=".xls, .xlsx, .csv"
    />
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
      json_array: [
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
        {
          id: 4,
          name: "asdfdfDinesh Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28,
        },
        {
          id: 5,
          name: "Dineshsfdgafsd Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28,
        },
      ],
      csv_data: "",
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
        self.json_array = await XLSX.utils.sheet_to_json(worksheet);

        self.csv_data = await XLSX.utils.sheet_to_csv(worksheet);

        // self.csv_data = csv_tmp.replace(/,/g, " ");

        // var wb = XLSX.read(csv_tmp, { type: "binary" });
        // self.csv_data = XLSX.write(wb, {
        //   bookType: "prn",
        //   type: "string",
        //   sheet: "Sheet1",
        // });
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
      this.csv_data = event.target.value;
    },
    onBlur(event) {
      // this.json_array = await XLSX.utils.csv2json(event.target.value);
      this.json_array = csv2json(event.target.value, { parseNumbers: true });
    },
  },
};
</script>
<style>
[v-cloak] {
  display: none;
}
#drop-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: absolute;
}
.common {
  width: 80%;
  height: 170px;
  /* position: absolute; */
}
.table-div {
  overflow: hidden;
}
.drop-rect {
  background: #eee;
}
.csv-area {
  height: 100%;
}
</style>
