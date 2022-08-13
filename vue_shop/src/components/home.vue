<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-sub-menu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template #title>
              <!-- 一级菜单图标 -->
              <i :class="iconObg[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveNavState('/'+subitem.path)"
            >
              <el-icon><Menu /></el-icon>
              <span>{{ subitem.authName }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ElMessage } from "element-plus";
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      iconObg: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      //是否折叠
      isCollapse: false,
      //是否高亮
      activePath: '',
    };
  },
  created() {
    this.getMenuList();
    this.activePath =window.sessionStorage.getItem("activePath");
  },
  methods: {
    logout() {
      //清除token
      window.sessionStorage.clear();
      //跳转到登录页面
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.$axios.get("menus");
      if (res.meta.staus == 200) return ElMessage.error(res.meta.msg);
      this.menulist = res.data;
    },
    //点击按键实现菜单折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //保存链接激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
       this.activePath =activePath
    },
  },
};
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>