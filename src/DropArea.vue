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
        <table>
          <tbody>
            <th v-for="(header, key) in headers" :key="'th' + key">{{ header }}</th>
            <tr v-for="(item, key) in json_array" :key="'tr' + key">
              <td v-for="(header, ikey) in headers" :key="'td' + ikey">{{ item[header] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="common csv-area">
        <textarea @paste="onPaste" @blur="onBlur" v-model="csv_data" ref="csvarea"></textarea>
      </div>
    </div>
    <div>
      <input
        type="file"
        name="fields[assetsFieldHandle][]"
        id="assetsFieldHandle"
        @change="onChange"
        ref="file"
        accept=".xls, .xlsx, .csv"
      />
      <button @click="callApi">call api</button>
    </div>
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
  data: function() {
    return {
      file: {},
      json_array: [
        {
          Address: "Crossgates Mall Road",
          City: "Albany",
          State: "NY",
          Zip: 12203,
          Name: "Apple Store Cross Gates",
          Phone: "(518) 869-3192",
          Group: "Example Group 1"
        },
        {
          Address: "Duke Rd & Walden Ave",
          City: "Buffalo",
          State: "NY",
          Zip: 14225,
          Name: "Apple Store Walden Galleria",
          Phone: "(716) 685-2762",
          Group: "Example Group 2"
        },
        {
          Address: "630 Old Country Rd.",
          City: "Garden City",
          State: "NY",
          Zip: 11530,
          Name: "Apple Store Roosevelt Field",
          Phone: "(516) 248-3347",
          Group: "Example Group 3"
        },
        {
          Address: "160 Walt Whitman Rd.",
          City: "Huntington Station",
          State: "NY",
          Zip: 11746,
          Name: "Apple Store Walt Whitman",
          Phone: "(631) 425-1563",
          Group: "Example Group 3"
        },
        {
          Address: "9553 Carousel Center Drive",
          City: "Syracuse",
          State: "NY",
          Zip: 13290,
          Name: "Apple Store Carousel",
          Phone: "(315) 422-8484",
          Group: "Example Group 2"
        },
        {
          Address: "2655 Richmond Ave",
          City: "Staten Island",
          State: "NY",
          Zip: 10314,
          Name: "Apple Store Staten Island",
          Phone: "(718) 477-4180",
          Group: "Example Group 1"
        },
        {
          Address: "7979 Victor Road",
          City: "Victor",
          State: "NY",
          Zip: 14564,
          Name: "Apple Store Eastview",
          Phone: "(585) 421-3030",
          Group: "Example Group 1"
        },
        {
          Address: "1591 Palisades Center Drive",
          City: "West Nyack",
          State: "NY",
          Zip: 10994,
          Name: "Apple Store Palisades",
          Phone: "(845) 353-6756",
          Group: "Example Group 2"
        },
        {
          Address: "125 Westchester Ave.",
          City: "White Plains",
          State: "NY",
          Zip: 10601,
          Name: "Apple Store The Westchester",
          Phone: "(914) 428-1877",
          Group: "Example Group 3"
        },
        {
          Address: "103 Prince Street",
          City: "New York",
          State: "NY",
          Zip: 10012,
          Name: "Apple Store SoHo",
          Phone: "(212) 226-3126",
          Group: "Example Group 2"
        }
      ],
      headers: [
        "Address",
        "City",
        "State",
        "Zip",
        "Name",
        "Phone",
        "Group",
        "latitude",
        "longitude"
      ],
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

      this.headers = [...headers, "latitude", "longitude"];
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
    async callApi() {
      let json_array_tmp = [...this.json_array];
      this.headers = [...this.headers, "latitude", "longitude"];
      this.headers.splice(0, this.headers.length, ...new Set(this.headers));

      for (let i = 0; i < json_array_tmp.length; i++) {
        let item = this.json_array[i];
        let city = "",
          state = "",
          postalcode = "";
        for (let obj of Object.entries(item)) {
          if (!obj) continue;

          if (obj[0].toString().toLowerCase() === "city")
            city = `&city=${obj[1]}`;
          if (obj[0].toString().toLowerCase() === "state")
            state = `&state=${obj[1]}`;
          if (obj[0].toString().toLowerCase() === "zip")
            postalcode = `&postalcode=${obj[1]}`;
        }

        let count = 0;
        let maxTries = 100;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            let url =
              "https://us1.locationiq.com/v1/search.php?key=pk.5583d733f08dd889b77df42f1d00337a&format=json&" +
              city +
              state +
              postalcode;

            let loc = await axios.get(url);

            item.latitude = loc.data[0].lat;
            item.longitude = loc.data[0].lon;
            console.log(url);
            console.log(count, "times you tried, and succed!");
            break;
          } catch (e) {
            if (++count == maxTries)
              console.log(e, maxTries, "times tried, but failed!");
          }
        }

        this.json_array[i] = item;
        this.json_array = [...this.json_array];
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
