<template>
  <div class="contentBox">
    <h5 style="margin-left: 50px;">文件内容</h5>
    <el-scrollbar class="scrollbar"
                  height="500px">
      <p v-for="line, index in fileContent"
         :key="index">
        {{ line }}
      </p>
    </el-scrollbar>

  </div>
</template>
<script setup>
const props = defineProps(['fileContent'])
</script>
<style>
p {
  margin: 10px;
  white-space: pre;
}


.contentBox .scrollbar {
  box-shadow: var(--el-box-shadow);
  display: flex;
  margin-left: 30px;
  width: 50%;
}

</style>