<template>
  <el-row style="height: 800px;">
    <el-col :span="12"
            v-loading="loading">
      <div style="margin-right: 10px;">
        <!-- 引擎初始化后显示的内容 -->
        <el-card v-if="init===true&&runStatus===0">
          <template #header>
            <div class="card-header">
              <span>{{ funcName }}</span>
              <el-button type="danger"
                         class="button"
                         @click="handleClickOnRemove()">删除实例</el-button>

            </div>
          </template>
          <div v-if="argType != '' ">
            <div v-for="(item, index) in argType"
                 :key="index"
                 class="text item">
              {{item}}
              <el-input v-model="input[index]"
                        placeholder="参数值" />
            </div>
          </div>
          <el-button type="primary"
                     class="button"
                     @click="handleClickOnRun()">运行</el-button>
        </el-card>

        <!-- 引擎未初始化时显示内容 -->
        <el-card v-else-if="init===false&&runStatus===0">
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

        <!-- 运行成功后显示的内容 -->
        <el-card v-else-if="runStatus===1">
          <template #header>
            <div class="card-header">
              <span>{{ funcName }}</span>
            </div>
          </template>
          <div>
            <el-result icon="success"
                       sub-title="运行成功">
              <template #title>
                返回值: {{ result }}
              </template>
              <template #extra>
                <el-button type="primary"
                           @click="back">返回</el-button>
              </template>
            </el-result>
          </div>
        </el-card>

        <!-- 运行失败后显示的内容 -->
        <el-card v-else-if="runStatus===2">
          <template #header>
            <div class="card-header">
              <span>{{ funcName }}</span>
            </div>
          </template>
          <div>
            <el-result icon="error">
              <template #title>
                {{ errorMessage }}
              </template>
              <template #extra>
                <el-button type="primary"
                           @click="back">返回</el-button>
              </template>
            </el-result>

          </div>
        </el-card>
      </div>

    </el-col>

    <el-col :span="12">
      <div>
        <el-table ref="logTableRef"
                  stripe
                  :data="runLogs"
                  style="width: 100%"
                  :default-sort="{ prop: 'date', order: 'descending' }"
                  height="200">
          <el-table-column type="index"
                           width="50"
                           fixed />
          <el-table-column fixed
                           prop="date"
                           label="时间"
                           width="250"
                           sortable />
          <el-table-column prop="result"
                           label="运行结果"
                           width="120" />
          <el-table-column prop="args"
                           label="参数值"
                           width="auto" />
        </el-table>
        <el-button style="position:absolute; 
        right: 0;"
            type="danger" 
            text 
            :disabled="runLogs.length===0 ? true:false"
            @click="deleteAllLog()">清空</el-button>
      </div>
    </el-col>
  </el-row>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElLoading } from 'element-plus'
import axios from 'axios'

const props = defineProps(['moduleName', 'funcName',
  'returnType', 'argType', 'argName',
  'index', 'init',
  'runLogs'])
const emit = defineEmits(['updateTag', 'updateTab', 'updateRunLogs'])
const loading = ref(false);
const input = ref([]);
const errorMessage = ref('');
const result = ref();
const logTableRef = ref();
onMounted(() => {
  axios.get(`http://localhost:8080/runlog/${props.moduleName}/${props.funcName}`).then(
    response => {
      const data = response.data;
      emit('updateRunLogs', data.runLogs);
    }
  )
})

//0:未运行 1:运行成功 2:运行失败,
const runStatus = ref(0);
const back = () => runStatus.value = 0;
function handleClickOnRemove () {
  axios.delete(`http://localhost:8080/engine/${props.moduleName}/${props.funcName}`).then(
    response => {
      const data = response.data;
      if (data.status == 1) alert(data.message);
      emit('updateTag', props.index, false);
      emit('updateTab', false);
    }
  )
}

function handleClickOnRun () {
  loading.value = true;
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
    loading.value = false;
    const data = response.data;
    if (data.status == 1) {
      runStatus.value = 2;
      errorMessage.value = data.message;
      return;
    } else {
      runStatus.value = 1;
      result.value = data.result;
      axios.get(`http://localhost:8080/runlog/${props.moduleName}/${props.funcName}`).then(
        response => {
          const data = response.data;
          emit('updateRunLogs', data.runLogs);
        }
      )
    }
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
      emit('updateTag', props.index, true);
      emit("updateTab", true);
    }
  })
}

function deleteAllLog() {
  axios.delete(`http://localhost:8080/runlog/${props.moduleName}/${props.funcName}`).then(
    response => {
      const data = response.data;
      if(data.status == 1) {
        alert(data.message);
      } else {
        emit('updateRunLogs', []);
      }
    }
  )
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