<template>
 <el-config-provider :locale="locale">
  <router-view></router-view>
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from 'element-plus'
 
// 中文包
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
 
export default {
  components: {
    [ElConfigProvider.name]: ElConfigProvider
  },
  setup() {
    // 刷新页面
    const fn = () => {
      location.reload()
    }
 
    // 切换为中文
    let locale = zhCn
    return {
      locale
    }
  }
}
</script>
<style>
</style>
