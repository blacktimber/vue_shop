<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!--添加角色按钮区域  -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRightDialog"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!--角色列表区域  -->
      <el-table :data="rolesList" border stripe row-key="id">
        <!-- 展开列 -->
        <el-table-column type="expand" label="展开列">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <el-icon><CaretRight /></el-icon>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['vcenter', i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <el-icon><CaretRight /></el-icon>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope" width="300px">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              size="small"
              @click="showEditRightDialog(scope.row.id)"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              size="small"
              @click="removerolesById(scope.row.id)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
            <!-- 分配权限按钮 -->
            <el-button
              type="warning"
              size="small"
              @click="showSetRightDialog(scope.row)"
            >
              <el-icon><Tools /></el-icon>
              <span>分配权限</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      v-model="addRightDialogVisible"
      title="添加角色"
      width="30%"
      @close="addRightDialogClosed"
    >
      <!-- 添加角色对话框 主体区域-->
      <el-form
        :model="addRight"
        ref="addRightRef"
        :rules="addRightRules"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRight.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRight.roleDesc" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRightDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addRightRoles">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      v-model="editRightDialogVisible"
      title="编辑角色"
      width="30%"
      @close="editRightDialogClosed"
    >
      <!-- 编辑角色对话框 主体区域-->
      <el-form
        :model="editRight"
        ref="editRightRef"
        :rules="editRightRules"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRight.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRight.roleDesc" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editRightDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editRightRoles">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="setRightDialogVisible"
      title="分配权限"
      width="30%"
      @close="setRightDialogClosed"
    >
      <!-- 树形空间 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all="true"
        :default-checked-keys="defKeys"
      >
      </el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="allotRights()">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
export default {
  data() {
    return {
      //所有角色列表数据
      rolesList: [],
      //分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      //添加角色对话框显示与隐藏
      addRightDialogVisible: false,
      //编辑角色对话框显示与隐藏
      editRightDialogVisible: false,
      //添加角色的表单数据
      addRight: {
        roleName: "",
        roleDesc: "",
      },
      //编辑角色的表单数据
      editRight: {
        roleName: "",
        roleDesc: "",
        roleId: "",
      },
      //角色权限列表数据
      rightsList: [],
      //树形控件绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      //默认选中的节点
      defKeys: [],
      //当前角色Id
      roleId: [],
      //添加角色表单验证规则对象
      addRightRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      //编辑角色表单验证规则对象
      editRightRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$axios.get("roles");
      if (res.meta.status !== 200) {
        return ElMessage.error("权限列表获取失败");
      }
      this.rolesList = res.data;
      // console.log(this.rolesList);
    },

    //根据ID删除对应权限
    async removeRightById(role, rightId) {
      const confirmResult = await ElMessageBox.confirm(
        "此操作将永久删除该权限，是否继续?",
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
      const { data: res } = await this.$axios.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        // console.log(res.meta.status);
        return ElMessage.error("数据链接失败");
      }
      role.children = res.data;
      //  ElMessage.success("取消权限成功");
      // 重新获得列表数据
    },
    //显示添加角色对话框
    showAddRightDialog() {
      this.addRightDialogVisible = true;
    },
    //显示编辑角色对话框
    async showEditRightDialog(id) {
      this.rightId = id;
      const { data: res } = await this.$axios.get("roles/" + id);
      //  console.log(res.data);
      if (res.meta.status !== 200) {
        return ElMessage.error("查询用户失败");
      }
      this.editRight = res.data;
      this.editRightDialogVisible = true;
    },
    //监听添加角色对话框关闭事件 清除上一次输入校验
    addRightDialogClosed() {
      this.$refs.addRightRef.resetFields();
    },
    //监听编辑角色对话框关闭事件 清除上一次输入校验
    editRightDialogClosed() {
      this.$refs.editRightRef.resetFields();
    },
    //确定按钮，添加角色信息
    addRightRoles() {
      this.$refs.addRightRef.validate(async (valid) => {
        if (!valid) return;
        //发起添加角色请求
        const { data: res } = await this.$axios.post("roles", this.addRight);
        if (res.meta.status !== 201) {
          return ElMessage.error("添加角色失败");
        }
        ElMessage.success("添加角色成功");
        //隐藏对话框
        this.addRightDialogVisible = false;
        //重新获得列表数据
        this.getRolesList();
      });
    },
    //确定按钮，编辑角色信息
    editRightRoles() {
      // console.log(this.editRight.roleId);
      this.$refs.editRightRef.validate(async (valid) => {
        if (!valid) return;
        //发起添加用户请求
        const { data: res } = await this.$axios.put(
          "roles/" + this.editRight.roleId,
          {
            roleName: this.editRight.roleName,
            roleDesc: this.editRight.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return ElMessage.error("修改用户失败");
        }
        ElMessage.success("修改用户成功");
        //隐藏对话框
        this.editRightDialogVisible = false;
        //重新获得列表数据
        this.getRolesList();
      });
    },
    //显示分配权限对话框
    async showSetRightDialog(role) {
      //获取所有权限的数据
      this.roleId = role.id;
      const { data: res } = await this.$axios.get("rights/tree");
      if (res.meta.status !== 200) {
        return ElMessage.error("权限列表获取失败");
      }
      this.rightsList = res.data;
      // console.log(this.rightsList);
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    //通过递归的形式，把角色的三级权限Id保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      //不包含children 不是三级权限
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    //监听分配对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    //点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$axios.post(
        `roles/${this.roleId}}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        console.log(res.meta.status);
        return ElMessage.error("更新失败");
      }
      ElMessage.success("更新成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
    //删除角色
  async  removerolesById(id) {
      const confirmResult = await ElMessageBox.confirm(
        "此操作将永久删除该角色，是否继续?",
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
      const { data: res } = await this.$axios.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return ElMessage.error("数据链接失败");
      }
      ElMessage.success("用户删除成功");
      //重新获得列表数据
      this.getRolesList();
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>