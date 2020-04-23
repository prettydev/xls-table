<template>
  <div id="drop-area">
    <h1>Paste your location data below to map it:</h1>
    <div class="drop-area">
      <div class="common table-div">
        <label class="tooltip"></label>
        <table
          class="data-table"
          @dragover="dragOver"
          @dragleave="dragLeave"
          @drop="drop"
          @mouseover="rectOver"
          @mouseleave="rectLeave"
          @click="rectClick"
        >
          <tbody>
            <th v-for="(header, key) in headers" :key="key">{{ header }}</th>
            <tr v-for="(item, key) in json_array" :key="key">
              <td v-for="(header, ikey) in headers" :key="ikey">
                {{ item[header] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="common csv-area">
        <textarea
          @paste="onPaste"
          @blur="onBlur"
          v-model="csv_data"
          ref="csvarea"
        ></textarea>
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
import { Parser } from "json2csv";

export default {
  name: "DropArea",
  delimiters: ["${", "}"],
  data: function() {
    return {
      file: {},
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
          name: "Dinesh Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28,
        },
      ],
      headers: ["id", "name", "job", "age"],
      csv_data: "",
    };
  },
  mounted: function() {
    console.log("mounted");
    this.rectLeave();
    this.hideCSVArea();
    const json2csvParser = new Parser();
    this.csv_data = json2csvParser.parse(this.json_array);
  },
  methods: {
    getSheetHeader(sheet) {
      console.log(435);
      var headers = [];
      var range = XLSX.utils.decode_range(sheet["!ref"]);
      var C,
        R = range.s.r; /* start in the first row */
      /* walk every column in the range */
      for (C = range.s.c; C <= range.e.c; ++C) {
        var cell =
          sheet[
            XLSX.utils.encode_cell({ c: C, r: R })
          ]; /* find the cell in the first row */

        var hdr = "UNKNOWN " + C; // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);

        headers.push(hdr);
      }
      this.headers = headers;
    },
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
        self.getSheetHeader(worksheet);
      };
      reader.readAsArrayBuffer(this.file);
    },
    dragOver(event) {
      console.log("dragOver");
      event.preventDefault();
      document.querySelector("label.tooltip").textContent =
        "drop your file here";
      this.showEffect();
    },
    dragLeave(event) {
      console.log("dragLeave");
      event.preventDefault();
      this.resetEffect();
    },
    drop(event) {
      event.preventDefault();
      this.$refs.file.files = event.dataTransfer.files;
      this.resetEffect();
      this.onChange();
    },
    showEffect() {
      document.querySelector(".table-div").style.border = "3px green solid";
      document.querySelector("label.tooltip").style.display = "inline";
    },
    resetEffect() {
      document.querySelector(".table-div").style.border = "1px gray solid";
      document.querySelector("label.tooltip").style.display = "none";
    },
    onPaste(event) {
      this.csv_data = event.target.value;
    },
    onBlur(event) {
      this.hideCSVArea();
      try {
        this.json_array = csv2json(event.target.value, { parseNumbers: true });
      } catch (e) {
        console.log(e);
      }
    },
    rectOver(e) {
      e.preventDefault();
      console.log("rectOver");
      document.querySelector("label.tooltip").textContent =
        "click to copy/paste, or drop your file here";
    },
    rectLeave() {
      console.log("rectLeave");
    },
    rectClick() {
      console.log("rectClick");
      this.showCSVArea();
      this.$refs.csvarea.focus();
      this.$refs.csvarea.select();
    },
    showCSVArea() {
      document.querySelector(".csv-area").style.display = "";
    },
    hideCSVArea() {
      document.querySelector(".csv-area").style.display = "none";
    },
  },
};
</script>
<style lang="scss">
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
  .common {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .table-div {
    overflow: hidden;
    background: white;
    border-radius: 5px;
    border: 1px gray solid;
    display: flex;
    -moz-box-shadow: inset 0 0 10px #666;
    -webkit-box-shadow: inset 0 0 10px #666;
    box-shadow: inset 0 0 10px #666;
    display: flex;
    align-items: center;
    justify-content: center;
    .tooltip {
      position: absolute;
      color: black;
      font-size: 28px;
      font-weight: bold;
      margin: 0 auto;
      display: none;
    }
    &:hover {
      border: 3px green solid;
      .tooltip {
        display: inline;
      }
    }
  }
  .csv-area {
    textarea {
      height: 100%;
      &:focus {
        background: white;
      }
    }
  }
}
</style>
