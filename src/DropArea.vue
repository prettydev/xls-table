<template>
  <div id="drop-area">
    <h1>Paste your location data below to map it:</h1>
    <div class="drop-area">
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
        @dragover="dragOver"
        @dragleave="dragLeave"
        @drop="drop"
        @mouseover="rectOver"
        @mouseleave="rectLeave"
        @click="rectClick"
      >
        <label class="tooltip"></label>
      </div>
      <div class="common csv-area">
        <textarea @paste="onPaste" @blur="onBlur" v-model="csv_data" ref="csvarea"></textarea>
      </div>
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
  delimiters: ["${", "}"],
  data: function() {
    return {
      file: {},
      csv_data: "",
      json_array: [
        {
          id: 1,
          name: "Richard Hendricks",
          job: "richard@piedpiper.com",
          age: 25
        },
        {
          id: 2,
          name: "Bertram Gilfoyle",
          job: "gilfoyle@piedpiper.com",
          age: 27
        },
        {
          id: 3,
          name: "Dinesh Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28
        },
        {
          id: 4,
          name: "asdfdfDinesh Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28
        },
        {
          id: 5,
          name: "Dineshsfdgafsd Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28
        }
      ]
    };
  },
  mounted: function() {
    this.rectLeave();
    this.hideCSVArea();
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
    dragOver(event) {
      event.preventDefault();
      this.showGreenBorder();
      document.querySelector("label.tooltip").textContent =
        "drop your file here";
      document.querySelector("label.tooltip").style.display = "";
    },
    dragLeave(event) {
      event.preventDefault();
      this.showGrayBorder();
      document.querySelector("label.tooltip").style.display = "none";
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
      this.hideCSVArea();
      try {
        // this.json_array = await XLSX.utils.csv2json(event.target.value);
        this.json_array = csv2json(event.target.value, { parseNumbers: true });
      } catch (e) {
        console.log(e);
      }
    },
    rectOver() {
      document.querySelector("label.tooltip").textContent =
        "click to copy/paste, or drop your file here";
      document.querySelector("label.tooltip").style.display = "";
      this.showGreenBorder();
    },
    rectLeave() {
      document.querySelector("label.tooltip").style.display = "none";
      this.showGrayBorder();
    },
    showGreenBorder() {
      document.querySelector(".drop-rect").style.border = "3px green solid";
    },
    showGrayBorder() {
      document.querySelector(".drop-rect").style.border = "1px gray solid";
    },
    rectClick() {
      this.showCSVArea();
      this.$refs.csvarea.focus();
    },
    onTable() {
      let next_state =
        document.querySelector(".table-div").style.display === "none"
          ? ""
          : "none";
      document.querySelector(".table-div").style.display = next_state;
    },
    onDropRect() {
      let next_state =
        document.querySelector(".drop-rect").style.display === "none"
          ? ""
          : "none";
      document.querySelector(".drop-rect").style.display = next_state;
    },
    onCSVArea() {
      document.querySelector(".csv-area").style.display === "none"
        ? this.showCSVArea()
        : this.hideCSVArea();
    },
    showCSVArea() {
      document.querySelector(".csv-area").style.display = "";
    },
    hideCSVArea() {
      document.querySelector(".csv-area").style.display = "none";
    }
  }
};
</script>
<style>
[v-cloak] {
  display: none;
}
.drop-area {
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
  width: 80%;
  height: 20%;
}
.common {
  width: 100%;
  height: 100%;
  position: absolute;
}
.table-div {
  overflow: hidden;
}
.drop-rect {
  background: white;
  border-radius: 5px;
  border: 1px gray solid;
  opacity: 0.7;
  display: flex;
  -moz-box-shadow: inset 0 0 10px #666;
  -webkit-box-shadow: inset 0 0 10px #666;
  box-shadow: inset 0 0 10px #666;
}
.csv-area textarea {
  height: 100%;
}
.csv-area textarea:focus {
  background: white;
}
label.tooltip {
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: black;
  font-size: 28px;
  font-weight: bold;
  z-index: 100;
  opacity: 1;
}
</style>
