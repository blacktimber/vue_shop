<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList()"
          >
            <template #append>
              <el-button @click="getUserList()"
                ><el-icon><Search /></el-icon
              ></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加按钮</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column label="序列" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- eslint-disable-next-line  -->
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope" width="180px">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(scope.row.id)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              size="small"
              @click="removeUserById(scope.row.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
            <!-- 分配权限按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" size="small">
                <el-icon><Tools /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        :currentPage="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加用户信息"
      width="30%"
      @close="addDialogClosed"
    >
      <!-- 添加用户对话框 主体区域-->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
      </el-form>
      <!-- 添加用户对话框 底部区域-->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addUser">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改用户信息"
      width="30%"
      @close="editDialogClosed"
    >
      <!-- 修改用户对话框主体区域 -->
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <!-- 修改用户对话框底部按钮区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editUserInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script >
import { ElMessage, ElMessageBox } from "element-plus";
export default {
  data() {
    //验证邮箱规则
    var checkEnail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    //验证手机号规则
    var checkmobile = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regmobile = /^((13[0-9])|(17[0-9])|(15[^4,\\D])|(18[0-9]))\d{8}$/;
      if (regmobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };

    return {
      //获取用户列表参数
      queryInfo: {
        query: "",
        //当前页数
        pagenum: 1,
        pagesize: 5,
      },
      userlist: [],
      total: 0,
      //控制对话框显示和隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        mobile: "",
        email: "",
      },
      //修改用户的表单数据
      editForm: {
        username: "",
        password: "",
        mobile: "",
        email: "",
      },
      //添加用户表单验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 2, max: 10, message: "长度在2到10个字符", trigger: "blur" },
        ],
        //验证密码是否合法
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在6到15个字符", trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" },
        ],
        //验证密码是否合法
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEnail, trigger: "blur" },
        ],
      },
      //修改用户表单验证规则对象
      editFormRules: {
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" },
        ],
        //验证密码是否合法
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEnail, trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$axios.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.ElMessage.error("列表获取失败");
      this.userlist = res.data.users;
      this.total = res.data.total;
      //  console.log(res.data.users.mg_state);
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听 状态开关
    async userStateChanged(userinfo) {
      // console.log(userinfo.mg_state);
      const { data: res } = await this.$axios.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        this.userinfo.mg_state = !userinfo.mg_state;
        return ElMessage.error("更新状态失败");
      }
      ElMessage.success("更新状态成功");
    },
    //监听添加用户对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //确定按钮，添加用户信息
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        //发起添加用户请求
        const { data: res } = await this.$axios.post("users", this.addForm);
        if (res.meta.status !== 201) {
          return ElMessage.error("添加用户失败");
        }
        ElMessage.success("添加用户成功");
        //隐藏对话框
        this.addDialogVisible = false;
        //重新获得列表数据
        this.getUserList();
      });
    },
    //修改用户对话框
    async showEditDialog(id) {
      const { data: res } = await this.$axios.get("users/" + id);
      //  console.log(res.data);
      if (res.meta.status !== 200) {
        return ElMessage.error("查询用户失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //监听修改用户对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        //发起添加用户请求
        const { data: res } = await this.$axios.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          return ElMessage.error("修改用户失败");
        }
        ElMessage.success("修改用户成功");
        //隐藏对话框
        this.editDialogVisible = false;
        //重新获得列表数据
        this.getUserList();
      });
    },
    //删除单个用户
    async removeUserById(id) {
      const confirmResult = await ElMessageBox.confirm(
        "此操作将永久删除该文件，是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return ElMessage.error("取消删除");
      }
      const { data: res } = await this.$axios.delete("users/" + id);
      if (res.meta.status !== 200) {
        return ElMessage.error("数据链接失败");
      }
      ElMessage.success("用户删除成功");
      //重新获得列表数据
      this.getUserList();
    },
  },
};
</script>

<style lang="less" scoped>
</style>