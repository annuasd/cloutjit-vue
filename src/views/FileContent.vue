<template>
  <el-row>
    <el-col :span="14">
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
    </el-col>
    <el-col :span="10">
      <div style="width:80%; margin: 20px; padding-top: 40px;">
        <el-card>
          <el-text class="mx-1"
                   type="primary">文件描述</el-text>
          <p v-if="isDesChange==true">{{ newDescription }}</p>
          <p v-else>{{ description }}</p>
          <el-button link
                     type="primary"
                     size="small"
                     @click.prevent="open">
            修改
          </el-button>
        </el-card>

      </div>

    </el-col>
  </el-row>

</template>
<script setup>
const props = defineProps(['fileContent', 'description', 'title'])
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { onMounted } from 'vue'
const isDesChange = ref(false);
const newDescription = ref('');
const moduleName = ref('');
onMounted(() => moduleName.value = props.title.split('.')[0]);

const open = () => {
  ElMessageBox.prompt('输入文件描述', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern:
      /^.{0,30}$/,
    inputErrorMessage: '字数超出长度',
  })
    .then(value => {
      axios.put(`http://localhost:8080/module/${moduleName.value}`, {
        description: value.value
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      ).then(response => {
        newDescription.value = value.value;
        isDesChange.value = true;
        ElMessage({
          type: 'success',
          message: `修改成功`,
        })
      })

    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Input canceled',
      })
    })
}
</script>
<style>
p {
  margin: 10px;
  white-space: pre;
}

.contentBox .scrollbar {
  width: 100%;
  box-shadow: var(--el-box-shadow);
  margin-left: 10px;
  margin-right: 10px;
}
</style>