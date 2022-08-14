<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template v-slot="scope">
          <el-tag v-if="scope.row.level === '0'">一级</el-tag>
          <el-tag type="success" v-if="scope.row.level === '1'">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>


<script>
import { ElMessage, Tag } from "element-plus";
export default {
  data() {
    return {
      rightsList: [],
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$axios.get("rights/list");
      if (res.meta.status !== 200) {
        return ElMessage.error("权限列表获取失败");
      }
      this.rightsList = res.data;
      // console.log(this.rightsList);
    },
  },
};
</script>

<style lang="less" scoped>
</style>