<template>
  <div id="drop-area">
    <div class="drop-area">
      <div
        class="common table-div"
        @dragover="dragOver"
        @dragleave="dragLeave"
        @drop="drop"
        @click="rectClick"
      >
        <div v-if="loading" class="loading">...loading</div>
        <table v-if="!loading">
          <tbody>
            <th v-for="(header, key) in headers" :key="'th' + key">{{ header }}</th>
            <tr v-for="(item, key) in json_array" :key="'tr' + key">
              <td v-for="(header, ikey) in headers" :key="'td' + ikey">
                <div v-if="header !== 'location'">{{ item[header] }}</div>
                <div v-if="header === 'location'">
                  <table>
                    <tbody>
                      <th>boundingbox</th>
                      <th>class,type</th>
                      <th>display_name</th>
                      <th>place_id,importance</th>
                      <th>lat,lon</th>
                      <th>licence</th>
                      <th>osm_id,osm_type</th>
                      <tr v-if="item[header].length === 0">
                        <td colspan="7" style="text-align:center;font-weight:bold">no result</td>
                      </tr>
                      <tr v-for="(loc, k) in item[header]" :key="k">
                        <td>
                          {{ loc.boundingbox[0] }}, {{ loc.boundingbox[1] }},
                          {{ loc.boundingbox[2] }}, {{ loc.boundingbox[3] }}
                        </td>
                        <td>{{ loc.class }},{{ loc.type }}</td>
                        <td>{{ loc.display_name }}</td>
                        <td>{{ loc.place_id }},{{ loc.importance }}</td>
                        <td>{{ loc.lat }}, {{ loc.lon }}</td>
                        <td>{{ loc.licence }}</td>
                        <td>{{ loc.osm_id }},{{ loc.osm_type }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="common csv-area">
        <textarea @paste="onPaste" @blur="onBlur" v-model="csv_data" ref="csvarea"></textarea>
      </div>
    </div>
    <input
      type="file"
      name="fields[assetsFieldHandle][]"
      id="assetsFieldHandle"
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
import axios from "axios";

export default {
  name: "DropArea",
  delimiters: ["${", "}"],
  loading: false,
  data: function() {
    return {
      file: {},
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
          name: "Dinesh Chugtai",
          job: "dinesh@piedpiper.com",
          age: 28
        }
      ],
      headers: ["id", "name", "job", "age"],
      csv_data: ""
    };
  },
  mounted: function() {
    this.hideCSVArea();
    const json2csvParser = new Parser();
    this.csv_data = json2csvParser.parse(this.json_array);
  },
  methods: {
    getSheetHeader(sheet) {
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

      this.headers = [...headers, "location"];
    },
    onChange() {
      this.file = this.$refs.file.files[0];
      let self = this;
      var reader = new FileReader();
      reader.onload = async function(e) {
        self.loading = true;
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        let sheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[sheetName];
        self.json_array = await XLSX.utils.sheet_to_json(worksheet);
        await self.getLocation(self.json_array);
        self.csv_data = await XLSX.utils.sheet_to_csv(worksheet);
        self.getSheetHeader(worksheet);
        self.loading = false;
      };
      reader.readAsArrayBuffer(this.file);
    },
    async getLocation(json_array) {
      for (let item of json_array) {
        let item_tmp = "";
        for (let [key, value] of Object.entries(item)) {
          key === 0;
          item_tmp += `${value}` + " ";
        }

        item.location = await new Promise(resolve => {
          setTimeout(async () => {
            try {
              let res = await axios.get(
                "https://us1.locationiq.com/v1/search.php?key=pk.5583d733f08dd889b77df42f1d00337a&format=json&q=" +
                  item_tmp
              );
              item.location = res.data;
              resolve(item.location);
            } catch (e) {
              // reject(`no result`);
              resolve([]);
            }
          }, 500);
        });
      }
    },
    dragOver(event) {
      event.preventDefault();
      this.showEffect();
    },
    dragLeave(event) {
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
    },
    resetEffect() {
      document.querySelector(".table-div").style.border = "1px gray solid";
    },
    onPaste(event) {
      this.csv_data = event.target.value;
    },
    async onBlur(event) {
      this.hideCSVArea();
      try {
        this.json_array = await csv2json(event.target.value, {
          parseNumbers: true
        });
        this.getLocation(this.json_array);
      } catch (e) {
        console.log(e);
      }
    },
    rectClick() {
      // this.showCSVArea();
      // this.$refs.csvarea.focus();
      // this.$refs.csvarea.select();
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
<style lang="scss">
[v-cloak] {
  display: none;
}
#drop-area {
  display: flex;
  justify-content: center;
  input {
    padding-top: 70px;
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
    width: 90%;
    height: 70%;
    .common {
      width: 100%;
      height: 100%;
      position: absolute;
    }
    .table-div {
      overflow: auto;
      background: white;
      border-radius: 5px;
      border: 1px gray solid;
      display: flex;
      -moz-box-shadow: inset 0 0 10px #666;
      -webkit-box-shadow: inset 0 0 10px #666;
      box-shadow: inset 0 0 10px #666;
      display: flex;
      justify-content: center;
      &:hover {
        border: 3px green solid;
      }
      th {
        border-bottom: 1px red solid;
      }
      .loading {
        font-weight: bold;
        font-size: 30;
        padding-top: 100px;
      }
    }
    .csv-area {
      textarea {
        width: 100%;
        height: 100%;
        &:focus {
          background: white;
        }
      }
    }
  }
}
</style>
