<template>
  <el-row>
    <el-col :span="12">
      <div class="box">
        <el-row class="fileContent"
                :span="18"
                :style="{'justify-content': (isLoad==true ?'flex-start' : 'center'),
                          'align-items': (isLoad==true ?'start' : 'center')}">
          <div v-if="isLoad==true">
            <el-scrollbar class="fileContentScollbar"
                          height="500px">
              <p v-for="line, index in fileContent"
                 :key="index"
                 style="white-space: pre;">
                {{ line }}
              </p>
            </el-scrollbar>
          </div>
          <div class="unload"
               v-else-if="isLoad==false">
            <el-empty description="尚未上传文件" />
          </div>
        </el-row>
        <el-row :span="6">
          <el-upload v-model:file-list="fileList"
                     ref="upload"
                     class="upload-button"
                     action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                     :auto-upload="false"
                     :limit="1"
                     :on-change="fileChange()"
                     :before-remove="fileRemove()"
                     :on-exceed="fileExceed">
            <el-button :loading="buttonLoad?true:false"
                       type="primary"
                       class="buttonDiv">
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                c files with a size less than 500KB.
              </div>
            </template>
          </el-upload>
          <el-button class="buttonDiv"
                     style="margin-left: auto;"
                     :disabled="isSelect ? false:true"
                     autofocus="true"
                     @click="upLoadFile()">
            上传并加载为模块
          </el-button>
        </el-row>
      </div>
    </el-col>

    <el-col :span="12">
      <div class="box"
           v-if="isLoad===true">
        <el-table :data="functions"
                  style="width: 100%">
          <el-table-column type="expand">
            <template #default="props">
              <div m="4"
                   v-if="hasArg[props.$index]==true">
                <h4>参数信息</h4>
                <el-table :data="props.row.args"
                          :border="childBorder">
                  <el-table-column label="参数名"
                                   prop="name" />
                  <el-table-column label="参数类型"
                                   prop="type" />
                </el-table>
              </div>
              <div v-else>
                <p>无参数</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="函数名"
                           prop="name" />
          <el-table-column label="返回值类型"
                           prop="returnType" />
          <el-table-column label="参数值类型"
                           prop="argType" />
        </el-table>
        <div v-if="hasDescription==true"
             class="box"
             style="margin: 20px;">
          <el-text class="mx-1"
                   size="large"
                   type="primary">文件描述</el-text>
          <p>{{ fileDescription }}</p>
        </div>
        <div v-if="hasDeclarations==true"
             class="box"
             style="margin: 20px;">
          <el-text class="mx-1"
                   size="large"
                   type="primary">外部符号</el-text>
          <div v-for="(item, index) in declarations"
               :key="index">
            <p>{{ item }}</p>
          </div>
        </div>
      </div>
      <div v-else
           class="box"
           style="padding: 10px;">
        <h4>模块描述信息</h4>
        <el-input v-model="descriptionInput"
                  maxlength="30"
                  placeholder="输入模块描述信息, 不超过30字"
                  show-word-limit
                  :disabled="isSelect ? false:true"
                  type="textarea" />
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref } from 'vue'
import { genFileId } from 'element-plus'
import axios from 'axios'
//文件是否已经选择
const isSelect = ref(false);
//文件是否上传成功
const isLoad = ref(false);
//文件是否有描述
const hasDescription = ref(false);
//是否有外部符号
const hasDeclarations = ref(true);

const fileList = ref([]);
const buttonLoad = ref(false);
const upload = ref(null);
const fileContent = ref([]);
const fileDescription = ref();
const declarations = ref([]);
//描述符
const descriptionInput = ref('');

const functions = ref([]);

const hasArg = ref([])

class FuncCol {
  args = [];
  name = '';
  returnType = '';
  argType = '';
};

class Arg {
  name = '';
  type = '';
}

const fileExceed = (files) => {
  if (upload.value) {
    upload.value.clearFiles();
    const newfile = files[0];
    newfile.uid = genFileId();
    upload.value.handleStart(newfile);
  }
}

function fileChange () {
  if (fileList.value.length == 1) {
    let file = fileList.value.at(-1).raw;
    let fileName = file.name;
    if (fileName.split('.').at(-1) != 'c') {
      alert("文件格式不为.c 请重新选择");
      fileList.value.pop();
      return;
    }
    isSelect.value = true;
  }
}

function fileRemove () {
  console.log("remove", fileList.value.length);
}

function upLoadFile () {
  isSelect.value = false;
  let file = fileList.value.pop().raw;
  let formData = new FormData();
  formData.append('f', file);
  formData.append('description', descriptionInput.value);
  let moduleName = file.name.split('.')[0];
  axios.post('http://localhost:8080/module',
    formData
  ).then(response => {
    const data = response.data
    if (data.status == 1) alert(JSON.stringify(data.message));
    else {
      isLoad.value = true;
      fileContent.value = data.fileContent;
      fileDescription.value = data.description;
      if (fileDescription.value != null && fileDescription.value != '')
        hasDescription.value = true;
      else hasDescription.value = false;
      axios.post('http://localhost:8080/function',
        { name: moduleName }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      ).then(
        response => {
          const data = response.data;
          if (data.status == 1) alert(JSON.stringify(data.message));
          else {
            functions.value = [];
            hasArg.value = [];

            if (data.moduleInfo.declarations == "" ||
              data.moduleInfo.declarations == null ||
              data.moduleInfo.declarations == undefined) {
              hasDeclarations.value = false;
            } else {
              hasDeclarations.value = true;
              let declarationsStr = data.moduleInfo.declarations;
              declarationsStr.trim().split(' ').forEach(item => {
                declarations.value.push(item);
              })
            }


            data.moduleInfo.funcInfos.forEach(item => {
              let funcCol = new FuncCol();
              funcCol.name = item.funcName;
              funcCol.returnType = item.returnType;
              let argString = item.funcArgs;
              argString.split(',').forEach((item) => {
                let str = item.trim();
                let arg = new Arg();
                arg.type = str.split(' ')[0];
                arg.name = str.split(' ')[1];
                funcCol.args.push(arg);
                funcCol.argType += arg.type + " ";
              })
              funcCol.argType.trim();
              functions.value.push(funcCol);
              if (funcCol.argType.length > 1) hasArg.value.push(true);
              else hasArg.value.push(false);
            });
          }
        }
      )
    }
  })
}

</script>
<style>
.upload-button {
  margin-bottom: 10px;
}
.box {
  margin-right: 10px;
  padding-top: 20px;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 10px;
}
.box .fileContent {
  height: 550px;
  margin-bottom: 20px;
  padding-top: 20px;
  padding-left: 20px;
}
.scrollbar {
  display: flex;
}
.buttonDiv,
.buttonDiv:focus:not(.buttonDiv:hover) {
  margin-right: 12px;
  border: 1px solid #5ca1ff;
  box-shadow: 0 2px 4px 0 #f4f4f4;
  color: #ffff;
  background: #68aafe;
}
.buttonDiv:focus,
.buttonDiv:hover {
  background: #eaf5ff;
  border: 1px solid #2794f8 !important;
  color: #2794f8;
}
.buttonDiv:active {
  background: #3489ff;
  color: white;
}

.fileContentScollbar {
  width: 100%;
}

</style>