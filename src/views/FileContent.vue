<template>
  <el-row>
    <el-col :span="14">
      <div class="contentBox">
        <h5 style="margin-left: 50px;">文件内容</h5>
        <el-scrollbar class="contentScrollbar"
                      height="500px">
          <p v-for="line, index in moduleTab.fileContent"
             :key="index">
            {{ line }}
          </p>
        </el-scrollbar>
      </div>
    </el-col>
    <el-col :span="10">
      <div style="width:80%; margin: 20px; padding-top: 40px;"
           v-loading="loading">
        <el-card>
          <el-text class="mx-1"
                   type="primary">文件描述</el-text>
          <p>{{ moduleTab.description }}</p>
          <el-button link
                     type="primary"
                     size="small"
                     @click.prevent="open">
            修改
          </el-button>
        </el-card>
        <el-card style="margin-top: 10px; margin-bottom: 10px;">
          <el-text class="mx-1"
                   type="primary">依赖</el-text>
          <p>{{ moduleTab.uses }}</p>

        </el-card>
        <div>
          <el-button v-if="moduleTab.isLib==false"
                     type="primary"
                     @click="addToLib()">添加为库</el-button>
          <el-button v-else-if="moduleTab.isLib==true"
                     type="danger"
                     @click="removeFromLib()">从库中删除</el-button>
          <el-button type="primary"
                     @click="addDependency()">设置依赖</el-button>
          <el-dialog v-model="dialogVisible"
                     title="连接库">
            <div v-for="(item, index) in libs"
                 :key="index">
              <el-checkbox v-model="libsCheck[index]"
                           :label="item.name"
                           :true-label="item.name"
                           size="large" />
            </div>
            <el-button @click="confirmLibsUpdate()">确定</el-button>
          </el-dialog>
        </div>
      </div>

    </el-col>
  </el-row>

</template>
<script setup>
const props = defineProps(['moduleTab'])
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { onMounted } from 'vue'
const moduleName = ref('');
onMounted(() => moduleName.value = props.moduleTab.title.split('.')[0]);
const libsCheck = ref([]);
const emit = defineEmits(['updateDescription', 'updateIsLib', 'updateUsesAndUsedBy'])
const dialogVisible = ref(false);
const libs = ref([]);
const loading = ref(false);
const open = () => {
  ElMessageBox.prompt('输入文件描述, 不超过30字', {
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
        emit('updateDescription', value.value);
        ElMessage({
          type: 'success',
          message: `修改成功`,
        })
      })

    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消',
      })
    })
}

function addToLib () {
  loading.value = true;
  axios.post('http://localhost:8080/lib',
    { name: moduleName.value }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  ).then(response => {
    loading.value = false;
    const data = response.data;
    if (data.stauts === 1) {
      alert(data.message);
      return;
    }
    emit("updateIsLib", true);
  })
}
function removeFromLib () {
  loading.value = true;
  axios.delete(`http://localhost:8080/lib/${moduleName.value}`).then(
    response => {
      const data = response.data;
      if (data.stauts === 1) alert(data.message);
      emit("updateIsLib", false);
      loading.value = false;
    }
  )
}

function addDependency () {
  dialogVisible.value = true;
  axios.get('http://localhost:8080/module'
  ).then(response => {
    const data = response.data;
    libs.value = data.moduleInfos.filter(
      item => item.isLib === true && item.name != moduleName.value
    )
  })
}

function confirmLibsUpdate () {
  let libs = null;
  if (libsCheck.value.length != 0 && libsCheck.value != ',')
    libs = libsCheck.value.join(',');
  axios.put(`http://localhost:8080/lib/${moduleName.value}`, {
    libs: libs
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  ).then(response => {
    const data = response.data
    if (data.stauts == 1) {
      alert(data.message);
      return;
    }
    emit('updateUsesAndUsedBy', libs, null);
  })
  dialogVisible.value = false;
}
</script>
<style>
p {
  margin: 10px;
  white-space: pre;
}

.contentScrollbar {
  width: 100%;
  box-shadow: var(--el-box-shadow);
  margin-left: 10px;
  margin-right: 10px;
}
</style>