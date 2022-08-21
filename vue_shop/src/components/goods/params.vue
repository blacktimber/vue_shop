<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部警告部分 -->
      <el-alert
        show-icon
        title="主要：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
      ></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col :span="3">
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
        </el-col>
        <el-col :span="6">
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="{ expandTrigger: hover, ...cateProps }"
            @change="handleChange"
            clearable
          >
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            class="Default"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <el-table
            :data="manyTableData"
            style="width: 100%"
            border
            stripe
            row-key="attr_id"
          >
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="InputRef"
                  v-model="scope.row.inputValue"
                  class="ml-1 w-20"
                  size="small"
                  @keyup.enter="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button
                  v-else
                  class="button-new-tag ml-1"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序列"></el-table-column>
            <el-table-column prop="attr_name" label="分类参数名称" sortable />
            <el-table-column label="操作" sortable>
              <template v-slot="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  size="small"
                  @click="showEdit(scope.row.attr_id)"
                >
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteEdit(scope.row.attr_id)"
                >
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            class="Default"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <el-table
            :data="onlyTableData"
            style="width: 100%"
            border
            stripe
            row-key="attr_id"
          >
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="InputRef"
                  v-model="scope.row.inputValue"
                  class="ml-1 w-20"
                  size="small"
                  @keyup.enter="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button
                  v-else
                  class="button-new-tag ml-1"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序列"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称" sortable />
            <el-table-column label="操作" sortable>
              <template v-slot="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  size="small"
                  @click="showEdit(scope.row.attr_id)"
                >
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteEdit(scope.row.attr_id)"
                >
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="'添加' + titleText"
      width="30%"
      @close="addDialogClosed"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="90px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addParams">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="'修改' + titleText"
      width="30%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="90px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editParams">确认</el-button>
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
      //商品分类列表
      cateList: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //级联选择框双向绑定
      selectCateKeys: [],
      //被激活页签名称
      activeName: "many",
      // 动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      //控制添加对话框
      addDialogVisible: false,
      //控制修改对话框
      editDialogVisible: false,
      //控制文本框按钮之间切换
      // inputVisible:false,
      //添加参数表单
      addForm: {
        attr_name: "",
      },
      //修改参数表单
      editForm: {
        attr_name: "",
        attr_id: "",
      },
      //文本框输入内容
      // inputValue:'',
      //表单验证对象
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入手机号", trigger: "blur" },
        ],
      },
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入手机号", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    // 获取所有商品分类列表
    async getCatelist() {
      const { data: res } = await this.$axios.get("categories");
      if (res.meta.status !== 200) {
        return ElMessage.error("链接失败！");
      }
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    //级联选择框变化是触发
    handleChange() {
      this.getParamsData();
    },

    // tag标签点击事件
    handleTabClick(tab, event) {
      if (tab.index == "0") {
        this.activeName = "many";
      } else if (tab.index == "1") {
        this.activeName = "only";
      }
      this.getParamsData();
      // console.log(this.manyTableData);
    },
    async getParamsData() {
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        this.manyTableData=[]
        this.onlyTableData=[]
        return;
      }
      const { data: res } = await this.$axios.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        // console.log( this.activeName);
        return ElMessage.error("链接失败！");
      }
      // console.log(res.data);
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //控制文本框的显示与隐藏
        item.inputVisible = false;
        //文本框输入的值
        item.inputValue = "";
      });
      // console.log(res.data);
      if (this.activeName == "many") {
        this.manyTableData = res.data;
        // console.log(this.manyTableData);
      } else {
        this.onlyTableData = res.data;
        //  console.log(this.onlyTableData);
      }
    },
    // 监听对话框的关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$axios.post(
          `categories/${this.cateId}/attributes`,
          { attr_name: this.addForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 201) {
          return ElMessage.error("链接失败！");
        }
        ElMessage.success("添加成功！");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    //显示修改对话框
    showEdit(id) {
      this.editForm.attr_id = id;
      // console.log(this.editForm.attr_id);
      this.editDialogVisible = true;
    },
    //修改参数
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        console.log(this.editForm.attr_id);
        const { data: res } = await this.$axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 200) {
          return ElMessage.error("链接失败！");
        }
        ElMessage.success("修改成功！");
        this.editDialogVisible = false;
        this.getParamsData();
      });
    },
    //删除参数
    async deleteEdit(id) {
      const confirmResult = await ElMessageBox.confirm(
        "此操作将永久删除该参数，是否继续?",
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
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        console.log(id);
        return ElMessage.error("数据链接失败");
      }
      ElMessage.success("参数删除成功");
      //重新获得列表数据
      this.getParamsData();
    },
    //文本框失去焦点或者回车触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //发起请求，保存数据
      this.saveAttrVals(row);
    },
    //提交参数函数
    async saveAttrVals(row) {
      const { data: res } = await this.$axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) {
        return ElMessage.error("链接失败！");
      }
      ElMessage.success("修改参数项成功！");
    },
    showInput(row) {
      row.inputVisible = true;
      //让文本框自动获得焦点
      // $nextTick 作用，当元素重新渲染后执行
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除对应的参数选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
  },
  computed: {
    //如果按钮需要被禁用返回 TRUE
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        // console.log(this.selectCateKeys.length);
        return true;
      }
      return false;
    },
    //当前选中Id
    cateId() {
      if (this.selectCateKeys.length == 3) {
        return this.selectCateKeys[2];
      }
      return null;
    },
    //动态计算标题文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
  .el-col {
    line-height: 35px;
  }
}
.el-tag {
  margin-left: 5px;
}
.ml-1 {
  width: 120px;
  margin-left: 5px;
}
</style>