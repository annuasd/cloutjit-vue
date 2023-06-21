<template>
  <el-row>
    <el-col :span="12">
      <!-- 引擎初始化后显示的内容 -->
      <el-card v-if="isInit==true">
        <template #header>
          <div class="card-header">
            <span>{{ funcName }}</span>
            <el-button type="danger"
                       class="button"
                       @click="handleClickOnRemove()">删除实例</el-button>

          </div>
        </template>
        <div v-for="(item, index) in argType"
             :key="index"
             class="text item">
          {{item}}
          <el-input v-model="input[index]"
                    placeholder="参数值" />
        </div>
        <el-button type="primary"
                   class="button"
                   @click="handleClickOnRun()">运行</el-button>
      </el-card>

      <!-- 引擎未初始化时显示内容 -->
      <el-card v-else>
        <template #header>
          <div class="card-header">
            <span>{{ funcName }}</span>
          </div>
        </template>
        <div>
          <el-result icon="warning"
                     title="函数尚未实例化">
            <template #extra>
              <el-button type="primary"
                         @click="handleClickOnInit()">创建函数实例</el-button>
            </template>
          </el-result>

        </div>
      </el-card>
    </el-col>
    <el-col :span="12"></el-col>
  </el-row>
</template>
<script setup>
import { ref, onMounted, onBeforeUpdate  } from 'vue'
import { ElLoading } from 'element-plus'
import axios from 'axios'

const props = defineProps(['moduleName', 'funcName', 'returnType', 'argType', 'argName', 'index', 'init'])
const emit = defineEmits(['updateTag'])

const input = ref([]);
const functionInfo = ref();
const isInit = ref(false);

onMounted(() => isInit.value = props.init);
function handleClickOnRemove () {
  axios.delete(`http://localhost:8080/engine/${props.moduleName}/${props.funcName}`).then(
    response => {
      const data = response.data;
      if (data.status == 1) alert(data.message);
      isInit.value = false;
      emit('updateTag', props.index, false);

    }
  )
}

function handleClickOnRun () {
  let args = input.value.join(' ');
  axios.put('http://localhost:8080/engine', {
    moduleName: props.moduleName,
    funcName: props.funcName,
    args: args
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(response => {
    const data = response.data;
    if (data.status == 1) {
      alert(data.message)
      return;
    }
    alert(data.result);
  })
}

function handleClickOnInit () {
  const loading = ElLoading.service({
    lock: false,
    text: '引擎初始化中',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  axios.post('http://localhost:8080/engine', {
    moduleName: props.moduleName,
    funcName: props.funcName,
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(response => {
    const data = response.data;
    loading.close();
    if (data.status == 1) alert(data.message);
    else {
      isInit.value = true;
      emit('updateTag', props.index, true);
    }
  })

}

</script>
<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 480px;
}
</style>