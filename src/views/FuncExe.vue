<template>
  <el-row style="height: 800px;">
    <el-col :span="12">
      <div v-loading="loading"
           style="margin-right: 10px;">
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
          <el-button link
                     type="primary"
                     size="large"
                     @click.prevent="dialogInputVisible=true">
            添加输入
          </el-button>
          <el-dialog v-model="dialogInputVisible"
                     title="添加输入信息">
            <el-input v-model="funcExeInput"
                      :autosize="{ minRows: 1, maxRows: 10 }"
                      type="textarea"
                      placeholder="输入信息">
            </el-input>
            <el-button type="primary"
                       @click="dialogInputVisible = false"
                       size="small"
                       style="margin-top:10px;margin-bottom: 10px;">
              确定
            </el-button>
          </el-dialog>
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
            <el-button type="primary"
                       link
                       @click="dialogOutputVisible = true"
                       size="large"
                       style="float: right;">
              查看输出
            </el-button>
            <el-dialog v-model="dialogOutputVisible"
                       title="输出">
              <el-scrollbar class="logscrollbar"
                            height="500px">
                <p v-for="line, index in output"
                   :key="index">
                  {{ line }}
                </p>
              </el-scrollbar>
            </el-dialog>
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
          <el-table-column prop="args"
                           width="auto">
            <template #default="scope">
              <el-button link
                         type="primary"
                         size="small"
                         @click.prevent="showdialogIOLog(scope)">
                输入/输出
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog v-model="dialogIOLogVisible">
          <el-row>
            <el-col :span=12>
              <el-text type="primary"
                       size="large">输入</el-text>
              <el-scrollbar class="logscrollbar"
                            height="500px">
                <div class="logContent">
                  {{ runLogs.at(ioLogIndex).input }}
                </div>
              </el-scrollbar>
            </el-col>
            <el-col :span=12>
              <el-text type="primary"
                       size="large">输出</el-text>
              <el-scrollbar class="logscrollbar"
                            height="500px">
                <div class="logContent">
                  {{ runLogs.at(ioLogIndex).output }}
                </div>
              </el-scrollbar>
            </el-col>
          </el-row>
        </el-dialog>
        <el-button style="position:absolute;right: 0;"
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
//弹出窗口
const dialogInputVisible = ref(false);
const dialogOutputVisible = ref(false);
const dialogIOLogVisible = ref(false);

const output = ref([]);

//函数执行是所需要的信息
const funcExeInput = ref("");

//输入输出弹出框对应的下标
const ioLogIndex = ref();

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
    args: args,
    input: funcExeInput.value
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
      data.output.forEach(item => {
        output.value.push(item)
      });
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

function deleteAllLog () {
  axios.delete(`http://localhost:8080/runlog/${props.moduleName}/${props.funcName}`).then(
    response => {
      const data = response.data;
      if (data.status == 1) {
        alert(data.message);
      } else {
        emit('updateRunLogs', []);
      }
    }
  )
}

function showdialogIOLog (scope) {
  dialogIOLogVisible.value = true;
  ioLogIndex.value = scope.$index;
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
.logscrollbar {
  width: 90%;
  box-shadow: var(--el-box-shadow);
}
.logContent {
  margin: 10px;
  white-space: pre;

}
</style>