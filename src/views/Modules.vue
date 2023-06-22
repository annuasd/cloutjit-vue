<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="12">
          <div class="selectBox">
            <el-input v-model="inputModuleName"
                      @keyup.enter="handleSelect()"
                      placeholder="查询模块"
                      class="input-with-select">
              <template #prepend>
                <el-button :icon="Search"
                           @click="handleSelect()" />
              </template>
            </el-input>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="selectBox">
            <el-input v-model="inputFunctionName"
                      @keyup.enter="handleSelect()"
                      placeholder="查询函数"
                      class="input-with-select">
              <template #prepend>
                <el-button :icon="Search"
                           @click="handleSelect()" />
              </template>
              <template #append>
                <el-select v-model="select"
                           placeholder="Select"
                           style="width: 115px">
                  <el-option label="Restaurant"
                             value="1" />
                  <el-option label="Order No."
                             value="2" />
                  <el-option label="Tel"
                             value="3" />
                </el-select>
              </template>
            </el-input>
          </div>
        </el-col>
      </el-row>

    </el-header>
    <el-main>
      <el-row :span="12">
        <el-col :span="12">
          <div class="box">
            <!---------------------- 模块展示------------------------->
            <el-table :data="modules"
                      :key="true"
                      :row-style="{height: '60px'}"
                      height="250"
                      style="width: 100%">
              <el-table-column prop="name"
                               label="模块名称" />
              <el-table-column v-if="isModuleDelete==true"
                               fixed="right"
                               width="120"
                               label="">
                <template #default="scope">
                  <el-button size="small"
                             type="danger"
                             @click="moduleDelete(scope.row.name, scope.$index)">Delete</el-button>
                </template>
              </el-table-column>
              <el-table-column v-else
                               fixed="right"
                               width="120">
                <template #default="scope">
                  <el-button link
                             type="primary"
                             size="small"
                             @click.prevent="addFileTab(scope)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-switch v-model="isModuleDelete" />
          <el-text size="large"
                   type="warning"> 删除模块 </el-text>
        </el-col>

        <el-col :span="12">
          <div class="box">
            <!----------------------- 函数展示 --------------------------->
            <el-table :data="functions"
                      :key="true"
                      height="250"
                      style="width: 100%">
              <el-table-column type="expand">
                <template #default="props">
                  <div m="4">
                    <p m="t-0 b-2">参数信息: {{ props.row.funcArgs }}</p>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="funcName"
                               label="函数名称" />
              <el-table-column prop="moduleName"
                               label="所属模块" />
              <el-table-column prop="returnType"
                               label="返回值类型" />
              <el-table-column width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.init === true ? 'success': 'warning'"
                          disable-transitions>{{ initTag(scope.row.init) }}</el-tag>
                </template>

              </el-table-column>
              <el-table-column fixed="right"
                               width="120">
                <template #default="scope">
                  <el-button link
                             type="primary"
                             size="small"
                             @click.prevent="addFuncTab(scope)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

        </el-col>

      </el-row>
      <el-row :span="12"
              :offset="1">
        <el-col :span="24">
          <el-tabs v-model="editableTabsValue"
                   type="card"
                   closable
                   class="tabs"
                   @tab-remove="removeTab">
            <el-tab-pane v-for="item in editableTabs"
                         :key="item.name"
                         :label="item.content.title"
                         :name="item.name">
              <!-- 通过v-if强制重新渲染页面解决（疑似）组件缓冲引起的问题 -->
              <div v-if="reRender===true">
                <div v-if="item.tabid===1"
                     class="view">
                  <el-alert v-if="item.content.isDelete===true"
                            title="该函数已被删除"
                            type="error"
                            :closable="false" />
                  <FunctionExeView v-else
                                   :moduleName="item.content.moduleName"
                                   :funcName="item.content.funcName"
                                   :returnType="item.content.returnType"
                                   :argType="item.content.argType"
                                   :argName="item.content.argName"
                                   :init="item.content.init"
                                   :runLogs="item.content.runLogs"
                                   :index="item.index"
                                   @update-tag="handleTagUpdate"
                                   @update-tab="init => item.content.init = init"
                                   @update-runLogs="value => item.content.runLogs = value" />
                </div>
                <div v-else-if="item.tabid===0"
                     class="view">
                  <el-alert v-if="item.content.isDelete===true"
                            title="该模块已被删除"
                            type="error"
                            :closable="false" />
                  <FileContentView v-else
                                   :fileContent="item.content.fileContent"
                                   :title="item.content.title"
                                   :description="item.content.description"
                                   @update-description=" value =>item.content.description=value" />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>
<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { onMounted } from 'vue'
import axios from 'axios'
import FunctionExeView from './FuncExe.vue'
import FileContentView from './FileContent.vue'


onMounted(() => {
  selectAllModules();
})
const inputModuleName = ref('');
const inputFunctionName = ref('');
const modules = ref([]);
const functions = ref([]);
const isModuleDelete = ref(false);
//强制重新渲染页面解决el-tabs缓冲问题
const reRender = ref(true);


const initTag = (init) => init ? "已实例化" : "未实例化";

const handleTagUpdate = (index, init) => functions.value.at(index).init = init;



function selectAllModules () {
  axios.get('http://localhost:8080/module'
  ).then(response => {
    const data = response.data;
    functions.value = [];
    modules.value = data.moduleInfos;
    data.moduleInfos.forEach(element => {
      element.funcInfos.forEach(element => {
        functions.value.push(element);
      });
    });
  })
}

function selectOneModule (moduleName) {
  axios.get(`http://localhost:8080/module/${moduleName}`
  ).then(response => {
    const data = response.data;
    modules.value = [];
    functions.value = [];
    if (data.moduleInfo.name === undefined) return;
    modules.value.push(data.moduleInfo);
    modules.value.at(-1).funcInfos.forEach(element => {
      functions.value.push(element);
    })
  })
}

function functionsSelect () {
  let mSet = new Set();
  axios.get(`http://localhost:8080/function/${inputFunctionName.value}`
  ).then(response => {
    functions.value = [];
    modules.value = [];
    response.data.funcInfos.forEach((item, i) => {
      functions.value.push(response.data.funcInfos.at(i));
      if (mSet.has(item.moduleName)) return;
      mSet.add(item.moduleName);
      axios.get(`http://localhost:8080/module/${item.moduleName}`
      ).then(response => {
        const data = response.data;
        if (data.moduleInfo.name === undefined) {
          alert("我擦，找到一个脱离模块存在的函数");
          return;
        }
        modules.value.push(data.moduleInfo);
      })
    })
  })
}

function selectFunctionByNameAndModuleName () {
  axios.get(`http://localhost:8080/function/${inputModuleName.value}/${inputFunctionName.value}`
  ).then(response => {
    const data = response.data;
    functions.value = data.funcInfos;
    modules.value.clear;
    axios.get(`http://localhost:8080/module/${inputModuleName.value}`
    ).then(response => {
      const data = response.data.moduleInfo;
      modules.value = [data];
    })
  })
}


function handleSelect () {
  if (inputModuleName.value === '' && inputFunctionName.value === '') {
    selectAllModules();
  }
  else if (inputModuleName.value != '' && inputFunctionName.value === '') {
    selectOneModule(inputModuleName.value);
  }
  else if (inputModuleName.value === '' && inputFunctionName.value != '') {
    functionsSelect();
  } else if (inputModuleName.value != '' && inputFunctionName.value != '') {
    selectFunctionByNameAndModuleName();
  }
}

function moduleDelete (name, index) {
  let funcs = modules.value.at(index).funcInfos;
  modules.value.splice(index, 1);
  functions.value = functions.value.filter(item => item.moduleName !== name)
  axios.delete(`http://localhost:8080/module/${name}`
  ).then(response => {
    let title = name + '.c';
    let mt = moduleTabMap.get(title);
    if (mt !== undefined)  mt.isDelete = true;
    funcs.forEach(item => {
      let ft = funcTabMap.get(name + '/' + item.funcName);
      if (ft !== undefined) ft.isDelete = true;
      
    })
    reRender.value = false;
    reRender.value = true;
  })
}

let tabIndex = 0;
const editableTabsValue = ref('0');
const editableTabs = ref([]);

class runLog {
  date = '';
  name = '';
  result = '';
  args = '';
}
class funcTab {
  title = '';
  funcName = '';
  returnType = '';
  moduleName = '';
  argType = [];
  argName = [];
  init = false;
  isDelete = false;
  runLogs = [];
};
class moduleTab {
  title = '';
  fileContent = [];
  description = '';
  isDelete = false;
};
let funcTabMap = new Map();
let moduleTabMap = new Map();


function addFileTab (scope) {
  const row = scope.row;
  let title = row.name + '.c';
  let mt = moduleTabMap.get(title);
  if (mt === undefined) mt = new moduleTab();
  mt.title = row.name + '.c';
  axios.get(`http://localhost:8080/file/${row.name}`
  ).then(response => {
    const data = response.data;
    mt.fileContent = data.fileContent;
    mt.description = data.description;
    console.log(JSON.stringify(mt.fileContent))
    const newTabName = `${++tabIndex}`
    editableTabs.value.push({
      name: newTabName,
      tabid: 0,
      content: mt,
      index: scope.$index
    })
    moduleTabMap.set(title, mt);
    editableTabsValue.value = newTabName
  })

}

function addFuncTab (scope) {
  const row = scope.row;
  let title = row.moduleName + '/' + row.funcName;
  let ft = funcTabMap.get(title);
  if (ft === undefined) {
    ft = new funcTab();
    ft.title = row.moduleName + '/' + row.funcName;
    ft.funcName = row.funcName;
    ft.returnType = row.returnType;
    ft.moduleName = row.moduleName;
    ft.init = row.init;
    const args = row.funcArgs.split(',');
    args.forEach(item => {
      const s = item.trim().split(' ');
      ft.argType.push(s[0]);
      ft.argName.push(s[1]);
    })
  }
  funcTabMap.set(title, ft);
  const newTabName = `${++tabIndex}`
  editableTabs.value.push({
    name: newTabName,
    tabid: 1,
    content: ft,
    index: scope.$index
  })
  editableTabsValue.value = newTabName
}

const removeTab = (targetName) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
}
</script>
<style>
.selectBox {
  margin-left: 15px;
  margin-top: 10px;
  width: 70%;
}

.box {
  margin-right: 10px;
  box-shadow: var(--el-box-shadow);
  padding-top: 10px;
  padding-left: 15px;
  padding-right: 15px;
}

.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
.view {
  height: auto;
  width: auto;
}
</style>