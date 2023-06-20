<template>
  <el-container>
    <el-header>
      <div class="menu">
        <el-menu :default-active="activeIndex"
                 mode="horizontal"
                 :router="true">
          <el-menu-item index="/index/upload">创建模块</el-menu-item>
          <el-menu-item index="/index/modules">模块控制台</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main> 
        <RouterView class="view"></RouterView>
    </el-main>
  </el-container>

</template>
  
<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
const route = useRoute()
const activeIndex = ref('');
onMounted(() => {
  if(route.path == '/index/modules') activeIndex.value = '/index/modules';
  else activeIndex.value = '/index/upload';
})
</script>
<style>
.view {
    border: 0px solid;
}

</style>
