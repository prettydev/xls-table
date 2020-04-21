<template>
  <Responsive
    :breakpoints="{
      small: (el) => el.width <= 900
    }"
  >
    <div slot-scope="el" :class="['Grid', { Small: el.is.small }]">
      <div class="Container">
        <vue-dropzone
          ref="dropzone"
          id="dropzone"
          :options="dropzoneOptions"
          @vdropzone-complete="afterComplete"
        ></vue-dropzone>
      </div>
      <div class="Container Scroll">
        <pre id="json"><div class="ResultsMessage">Results</div></pre>
      </div>
    </div>
  </Responsive>
</template>

<script>
import { Responsive } from 'vue-responsive-components';
import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import XLSX from 'xlsx';
export default {
  name: 'DropZone',
  plugins: [
    {
      src: '~plugins/vue-js-xlsx.js',
      ssr: false
    }
  ],
  components: {
    Responsive,
    vueDropzone: vue2Dropzone
  },
  methods: {
    afterComplete(file) {
      var reader = new FileReader();
      reader.onload = async function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        let sheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[sheetName];
        let jsonData = await XLSX.utils.sheet_to_json(worksheet);
        document.getElementById('json').innerHTML = JSON.stringify(
          jsonData,
          undefined,
          2
        );
      };
      reader.readAsArrayBuffer(file);
    }
  },
  data: function() {
    return {
      dropzoneOptions: {
        acceptedFiles: '.xlsx',
        url: 'https://httpbin.org/post',
        maxFiles: 1,
        thumbnailWidth: 150,
        maxFilesize: 0.5,
        addRemoveLinks: true,
        headers: { 'My-Awesome-Header': 'header value' }
      }
    };
  }
};
</script>

<style>
.Grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 50vh;
  grid-gap: 2.5%;
  width: 95%;
  margin: auto;
}
.Grid.Small {
  grid-template-columns: 1fr;
}
.Container {
  height: 100%;
  border: 1px solid black;
  display: flex;
  justify-content: center;
}

.Scroll {
  overflow-y: scroll;
}
#json {
  text-align: left;
}
#dropzone {
  width: 100%;
  border: none;
}
.ResultsMessage {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  margin: 2em 0;
}
</style>
