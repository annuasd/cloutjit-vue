<template>
  <el-row>
    <el-col :span="12">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ funcName }}</span>
            <el-button type="primary"
                       class="button"
                       @click="handleClick()">运行</el-button>
          </div>
        </template>
        <div v-for="(item, index) in argType"
             :key="index"
             class="text item">
          {{item}}
          <el-input v-model="input[index]"
                    placeholder="参数值" />
        </div>
      </el-card>
    </el-col>

  </el-row>
</template>
<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import axios from 'axios'

const props = defineProps(['moduleName', 'funcName', 'returnType', 'argType', 'argName'])

const input = ref([]);
onMounted(() => input.value.length = props.argType.length);
function handleClick () {
  let argTypeString = props.argType.join(',');
  let typeString = `${props.returnType}(${argTypeString})`;
  let valueString = input.value.join(',');
  axios.put('http://localhost:8080/function', {
    moduleName: props.moduleName,
    funcName: props.funcName,
    funcType: typeString,
    funcArgs: valueString
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(response => {
    const data = response.data;
    alert(data);
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