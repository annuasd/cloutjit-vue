<template>
  <div>
    <p v-for="line, index in fileContent"
       :key="index">
      {{ line }}
    </p>
  </div>
</template>
<script setup>
const props = defineProps(['fileContent'])

</script>
<style>
p {
  white-space: pre;
}
</style>