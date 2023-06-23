<template>
  <div id="login-container">

    <el-form ref="ruleFormRef"
             :model="ruleForm"
             status-icon
             :rules="rules"
             label-width="120px"
             class="demo-ruleForm">

      <el-form-item label="用户名"
                    prop="username">
        <el-input v-model="ruleForm.username"
                  autocomplete="off" />
      </el-form-item>

      <el-form-item label="密码"
                    prop="password">
        <el-input v-model="ruleForm.password"
                  type="password"
                  autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
                   @click="submitForm(ruleFormRef)">登录</el-button>
        <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
      </el-form-item>
    </el-form>
    </div>
</template>

<script  setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter();
const ruleFormRef = ref();
const validatePass = (rule, value, callback) => {
  if (value !== 'annuasd') {
    callback(new Error('用户名错误'));
  } else {
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value !== '2020007491') {
    callback(new Error('密码错误'));
  }  else {
    callback();
  }
};

const ruleForm = reactive({
  username: '',
  password: '',
});

const rules = reactive({
  username: [{ validator: validatePass, trigger: 'blur' }],
  password: [{ validator: validatePass2, trigger: 'blur' }],
});

const submitForm = (formEl) => {
  router.push({path: '/'})
};

const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
};

</script>
<style>
body {
  margin: 0;
}
#login-container {
  width: 400px;
  height: 150px;
  background: #e5e9f2;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -220px;
  margin-top: -170px;
  border-radius: 5px;
  padding-top: 40px;
  padding-right: 40px;
}
</style>
