<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <!-- 分页区域 -->
      <el-table
        :data="catelist"
        style="width: 100%; margin-bottom: 20px"
        row-key="cat_id"
      >
        <el-table-column
          prop="cat_name"
          label="分类名称"
          sortable
          width="180"
        />
        <el-table-column
          prop="cat_deleted"
          label="是否有效"
          sortable
          width="180"
        >
          <template v-slot="scope" class="cat_deleted">
            <el-icon
              v-if="scope.row.cat_deleted === false"
              style="color: lightgreen; margin: 0 auto"
              ><CircleCheckFilled
            /></el-icon>
            <el-icon v-else style="color: red"><CircleCloseFilled /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="cat_level" label="排序" sortable width="180">
          <template v-slot="scope">
            <el-tag v-if="scope.row.cat_level === 0" size="small">一级</el-tag>
            <el-tag type="success" v-if="scope.row.cat_level === 1" size="small"
              >二级</el-tag
            >
            <el-tag type="warning" v-if="scope.row.cat_level === 2" size="small"
              >三级</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" sortable width="180">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" size="small" @click="showEditCate(scope.row.cat_id)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              size="small"
              @click="delectCate(scope.row.cat_id)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        :currentPage="querInfo.pagenum"
        :page-size="querInfo.pagesize"
        :page-sizes="[3, 5, 10, 15]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      v-model="addCateDialogVisible"
      title="添加分类"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加用户对话框 主体区域-->
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="90px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_name">
          <el-cascader
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="parentCateForm"
            :props="{
              expandTrigger: 'hover',
              checkStrictly: true,
              ...cascaderProps,
            }"
            @change="parentCateChange"
            clearable
          />
        </el-form-item>
      </el-form>
      <!-- 添加用户对话框 底部区域-->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addCate">确定</el-button>
        </span>
      </template>
    </el-dialog>
      <!-- 编辑角色名称对话框 -->
  <el-dialog
    v-model="editCateDialogVisible"
    title="修改角色名称"
    width="50%"
    @close="editCateDialogClosed"
  >
    <!-- 编辑角色名称对话框主体区域 -->
    <el-form
      ref="editCateFormRef"
      :model="editCateForm"
      :rules="editCateFormRules"
      label-width="70px"
    >
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="editCateForm.cat_name" />
      </el-form-item>
    </el-form>
    <!-- 编辑角色名称对话框底部按钮区域 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editCateInfo">确定</el-button>
      </span>
    </template>
  </el-dialog>
  </div>
</template>
<script>
import { ElMessage,ElMessageBox } from "element-plus";
export default {
  data() {
    return {
      //查询条件
      querInfo: {
        type: 3,
        //当前页数
        pagenum: 1,
        pagesize: 5,
      },
      //添加分类的表单数据
      addCateForm: {
        cat_name: "",
        //分类等级默认为一级
        cat_level: 0,
        //父级Id
        cat_pid: 0,
      },
      //商品分类列表,默认为空
      catelist: [],
      //总数据条数
      total: 0,
      //添加分类对话框默认关闭
      addCateDialogVisible: false,
      //父级分类列表
      parentCateForm: [],
      //指定级联选择器对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //选中父级分类Id数组
      selectedKeys: [],
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //修改分类名称列表
      editCateForm:{
        cat_name:'',
        cat_id:0
      },
      //编辑对话框默认关闭
      editCateDialogVisible:false,
      //输入框校验规则
      editCateFormRules:{ cat_name: [
   { required: true, message: "请输入分类名称", trigger: "blur" },
 ],}

    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return ElMessage.error("商品分类获取失败");
      }
      //把数据列表赋值给catelist
      this.catelist = res.data.result;
      //为总数据条数赋值
      this.total = res.data.total;
      //  console.log(this.catelist);
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    //显示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //监听添加分类对话框的关闭
    addCateDialogClosed() {
      //清除上一次的验证
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    //监听编辑分类名称对话框的关闭
    editCateDialogClosed(){
       this.$refs.editCateFormRef.resetFields();
    },
    //获取父级分类的列表
    async getParentCateList() {
      const { data: res } = await this.$axios.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return ElMessage.error("商品分类获取失败");
      }
      this.parentCateForm = res.data;
    },
    //选中项发生变化触发函数
    parentCateChange() {
      // console.log(this.selectedKeys);
      // 如果 this.selectedKeys 数组中length 大于0,有选中分类
      if (this.selectedKeys.length > 0) {
        //父级分类id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        //当前分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length;
        // console.log(this.addCateForm);
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //添加分类确定按钮
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$axios.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return ElMessage.error("商品分类添加失败");
        }
        console.log(this.selectedKeys);
        ElMessage.success("商品分类添加成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    //删除按钮
   async delectCate(id) {
      const confirmResult = await ElMessageBox.confirm(
        "此操作将永久删除该分类，是否继续?",
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
      const { data: res } = await this.$axios.delete("categories/" + id);
      if (res.meta.status !== 200) {
        console.log(id);
        return ElMessage.error("数据链接失败");
        
      }
      ElMessage.success("用户删除成功");
      //重新获得列表数据
       this.getCateList();
    },
    //显示修改对话框
    showEditCate(id){
      this.editCateForm.cat_id=id
      this.editCateDialogVisible = true
    },
    //修改分类名称
    editCateInfo(){
       this.$refs.editCateFormRef.validate(async (valid) => {
   if (!valid) return;
   //发起添加用户请求
   const { data: res } = await this.$axios.put(
     "categories/" + this.editCateForm.cat_id , {
   cat_name: this.editCateForm.cat_name
 });
   if (res.meta.status !== 200) {
    // console.log(this.editCateForm.cat_id);
     return ElMessage.error("更新失败");
   }
   ElMessage.success("修改分类名称成功");
   //隐藏对话框
   this.editCateDialogVisible = false;
   //重新获得列表数据
   this.getCateList();
 });
    }
  },
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>