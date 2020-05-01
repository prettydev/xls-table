<template>
  <div id="drop-area">
    <div class="control-area">
      <input
        type="file"
        name="fields[assetsFieldHandle][]"
        id="assetsFieldHandle"
        @change="onChange"
        ref="file"
        accept=".xls, .xlsx, .csv"
      />
      <v-btn small color="primary" @click="callApi">call api</v-btn>
    </div>
    <div
      class="drop-rect"
      @dragover="dragOver"
      @dragleave="dragLeave"
      @drop="drop"
      @click="rectClick"
    >
      <textarea
        class="csv-area"
        @paste="onPaste"
        @blur="onBlur"
        v-model="csv_data"
        ref="csvarea"
      ></textarea>
    </div>
    <div class="drop-area">
      <v-data-table :headers="headers" :items="json_array">
        <template v-slot:item.name="props">
          <v-edit-dialog
            :return-value.sync="props.item.name"
            @save="save"
            @cancel="cancel"
            @open="open"
            @close="close"
          >
            {{ props.item.name }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.name"
                :rules="[max25chars]"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.address="props">
          <v-edit-dialog
            :return-value.sync="props.item.address"
            @save="save"
            @cancel="cancel"
            @open="open"
            @close="close"
          >
            {{ props.item.address }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.address"
                :rules="[max25chars]"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.city="props">
          <v-edit-dialog
            :return-value.sync="props.item.city"
            @save="save"
            @cancel="cancel"
            @open="open"
            @close="close"
          >
            {{ props.item.city }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.city"
                :rules="[max25chars]"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.state="props">
          <v-edit-dialog
            :return-value.sync="props.item.state"
            @save="save"
            @cancel="cancel"
            @open="open"
            @close="close"
          >
            {{ props.item.state }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.state"
                :rules="[max25chars]"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.zip="props">
          <v-edit-dialog
            :return-value.sync="props.item.zip"
            @save="save"
            @cancel="cancel"
            @open="open"
            @close="close"
          >
            {{ props.item.zip }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.zip"
                :rules="[max25chars]"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
      </v-data-table>
      <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
        {{ snackText }}
        <v-btn text @click="snack = false">Close</v-btn>
      </v-snackbar>
    </div>
  </div>
</template>

<script>
import XLSX from "xlsx";
import csv2json from "csvjson-csv2json";
import { Parser } from "json2csv";
import axios from "axios";

export default {
  name: "SeparatedArea",
  delimiters: ["${", "}"],
  data: function() {
    return {
      snack: false,
      snackColor: "",
      snackText: "",
      max25chars: (v) => v.length <= 25 || "Input too long!",
      pagination: {},
      file: {},
      json_array: [],
      headers: [
        {
          align: "center",
          sortable: false,
          text: "Name",
          value: "name",
          width: "25%",
        },
        {
          align: "center",
          sortable: false,
          text: "Address",
          value: "address",
          width: "30%",
        },
        {
          align: "center",
          sortable: false,
          text: "City",
          value: "city",
          width: "10%",
        },
        {
          align: "center",
          sortable: false,
          text: "State",
          value: "state",
          width: "1%",
        },
        {
          align: "center",
          sortable: false,
          text: "Zip",
          value: "zip",
          width: "1%",
        },
        {
          align: "center",
          sortable: false,
          text: "Lat",
          value: "lat",
          width: "10%",
        },
        {
          align: "center",
          sortable: false,
          text: "Lng",
          value: "lng",
          width: "10%",
        },
      ],
      csv_data: "",
    };
  },
  mounted: function() {
    this.$refs.csvarea.style.display = "none";
    const json2csvParser = new Parser();
    this.csv_data = json2csvParser.parse(this.json_array);
  },
  methods: {
    getSheetHeader(sheet) {
      let columns = 0;
      let range = XLSX.utils.decode_range(sheet["!ref"]);

      for (let C = range.s.c; C <= range.e.c; ++C) {
        columns++;
      }
      return columns;
    },
    onChange() {
      this.file = this.$refs.file.files[0];
      let self = this;
      let reader = new FileReader();
      reader.onload = async function(e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: "array" });
        let sheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[sheetName];

        let columns = self.getSheetHeader(worksheet);

        if (columns > 4) {
          let tmp = await XLSX.utils.sheet_to_json(worksheet);
          self.json_array = await self.convertKeysToLowerCase(tmp);
          self.csv_data = await XLSX.utils.sheet_to_csv(worksheet);
        }
      };
      reader.readAsArrayBuffer(this.file);
    },
    convertKeysToLowerCase(arr) {
      let output = [];
      for (let i = 0; i < arr.length; i++) {
        let tmp = {};
        for (let obj of Object.entries(arr[i])) {
          if (!obj) continue;
          let key = obj[0].toString().toLowerCase();
          let val = obj[1].toString();
          tmp[key] = val;
        }
        output.push(tmp);
      }

      return output;
    },
    async callApi() {
      let json_array_tmp = [...this.json_array];
      // this.headers = [...this.headers, "Lat", "Lng"];
      // this.headers.splice(0, this.headers.length, ...new Set(this.headers));

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

            item.lat = loc.data[0].lat;
            item.lng = loc.data[0].lon;
            // console.log(url);
            break;
          } catch (e) {
            if (++count === maxTries)
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
      document.querySelector(".drop-rect").style.border = "3px green dashed";
    },
    resetEffect() {
      document.querySelector(".drop-rect").style.border = "1px gray dashed";
    },
    onPaste(event) {
      this.csv_data = event.target.value;
    },
    async onBlur(event) {
      try {
        let tmp_array = await csv2json(event.target.value, {
          parseNumbers: true,
        });
        let tmp = tmp_array[0];
        if (Object.entries(tmp).length < 5) {
          this.json_array = [];
          console.log("csv data must be 5 columns...");
        } else {
          this.json_array = await this.convertKeysToLowerCase(tmp_array);
        }
      } catch (e) {
        console.log("onBlur exception", e);
      } finally {
        this.$refs.csvarea.style.display = "none";
      }
    },
    rectClick() {
      this.$refs.csvarea.style.display = "";
      this.$refs.csvarea.style.width = "100%";
      this.$refs.csvarea.style.height = "100%";
      this.$refs.csvarea.focus();
      this.$refs.csvarea.select();
    },
    save() {
      this.snack = true;
      this.snackColor = "success";
      this.snackText = "Data saved";
    },
    cancel() {
      this.snack = true;
      this.snackColor = "error";
      this.snackText = "Canceled";
    },
    open() {
      this.snack = true;
      this.snackColor = "info";
      this.snackText = "Dialog opened";
    },
    close() {
      console.log("Dialog closed");
    },
  },
  computed: {
    saleables: function() {
      return this.$store.getters["saleables/items"];
    },
  },
};
</script>
<style lang="scss">
[v-cloak] {
  display: none;
}
#drop-area {
  display: flex;
  flex-direction: column;
  .drop-area,
  .drop-rect,
  .control-area {
    margin: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .control-area {
    padding-bottom: 30px;
    padding-top: 50px;
  }
  .drop-rect {
    border: gray 1px dashed;
    width: 70%;
    height: 100px;
    &:hover {
      border: 3px green dashed;
    }
  }
  .drop-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 75%;
    padding-top: 30px;
    .table-div {
      overflow: auto;
      background: white;
      border-radius: 5px;
      border: 1px gray solid;
      display: flex;
      justify-content: center;
      td {
        border-bottom: 0;
        margin: 0;
        padding: 0;
        input {
          padding: 5;
          margin: 0;
        }
      }
    }
    .drop-rect {
      text-area.csv-area {
        &:focus {
          background: white;
        }
      }
    }
  }
}
</style>
