<template>
  <div>
    <span>CSV Data is:</span>
    <p style="white-space: pre-line;">{{ csvdata }}</p>
    <br />
    <textarea v-model="csvdata" placeholder="add multiple lines"></textarea>
  </div>
</template>

<script>
export default {
  name: "CSVArea"
};
</script>
