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
          <el-button type="primary">添加角色</el-button>
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
            <el-button type="primary" size="small">
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" size="small">
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
      roleId:[]
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
    //显示分配权限对话框
    async showSetRightDialog(role) {
      //获取所有权限的数据
      this.roleId=role.id
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
      const { data: res } = await this.$axios.post(`roles/${this.roleId}}/rights`,{rids:idStr});
      if (res.meta.status !== 200) {
        console.log(res.meta.status);
        return ElMessage.error("更新失败");
      }
      ElMessage.success("更新成功");
      this.getRolesList()
      this.setRightDialogVisible = false;
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