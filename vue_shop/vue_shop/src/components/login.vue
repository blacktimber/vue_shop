<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="logo.png" alt="" :onerror="defaultImg" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        label-width="80px"
        class="login_form"
        :model="loginform"
        :rules="loginformRules"
        ref="loginformRef"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginform.username">
            <template #prefix>
              <el-icon class="iconfont icon-user"></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginform.password" type="password">
            <template #prefix>
              <el-icon class="iconfont icon-3702mima"></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetloginform">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
export default {
  data() {
    return {
      //整个表单的数据绑定
      loginform: {
        username: "admin",
        password: "123456",
      },
      //表单验证规则对象
      loginformRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在3到10个字符", trigger: "blur" },
        ],
        //验证密码是否合法
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在6到15个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    resetloginform() {
      //重置表单
      this.$refs.loginformRef.resetFields();
    },
    login() {
      //登录预验证
      this.$refs.loginformRef.validate(async (valid) => {
        //预验证通过为TRUE
        if (!valid) return;
        const { data: res } = await this.$axios.post("login", this.loginform);
        if (res.meta.status !== 200) return ElMessage.error("登录失败");
        ElMessage({message: "登录成功", type: "success",});
          //1、保存token到客户端sessionStorage中
          //1.1 只能登录成功后访问其他页面
        window.sessionStorage.setItem('token',res.data.token)
        //2、登录成功后跳转到后台主页，路由地址'/home'
        this.$router.push('/home')
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 30px;
  width: 100%;
  padding-right: 50px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  padding-left: 80px;
  justify-content: flex-end;
}
</style>