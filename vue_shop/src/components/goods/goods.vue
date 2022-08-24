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
      <!-- 顶部搜索框与添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="querInfo.query"
            clearable
            @clear="getGoodList"
          >
            <template #append>
              <el-button @click="getGoodList">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table
        :data="goodList"
        style="width: 100%; margin-bottom: 20px"
        border
        stripe
      >
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column
          prop="goods_name"
          label="商品名称"
          sortable
        ></el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格（￥）"
          width="110px"
        ></el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="80px"
        ></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160px">
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template v-slot="scope">
            <el-button
              type="primary"
              size="small"
              @click="editGood(scope.row.goods_id)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              size="small"
              @click="deleteGood(scope.row.goods_id)"
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
        :page-sizes="[5, 10, 15, 20]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改商品信息"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="90px"
        @close="editDialogClosed"
      >
        <el-form-item label="商品名称   " prop="goods_name">
          <el-input v-model="editForm.goods_name" />
        </el-form-item>
        <el-form-item label="价格" prop="goods_price">
          <el-input v-model="editForm.goods_price" />
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
          <el-input v-model="editForm.goods_number" />
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="editForm.goods_introduce" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="{ expandTrigger: hover, ...cateProps }"
            @change="handleChange"
            clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editGoods">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";
export default {
  data() {
    return {
      cateList: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //级联选择框双向绑定
      selectCateKeys: [],
      //查询参数对象
      querInfo: {
        query: "",
        //当前页数
        pagenum: 1,
        pagesize: 10,
      },
      editForm: {},
      //商品列表
      goodList: [],
      goodId: 0,
      total: 0,
      editDialogVisible: false,
      editFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getGoodList();
  },
  methods: {
    //获取商品列表
    async getGoodList() {
      const { data: res } = await this.$axios.get("goods", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return ElMessage.error("获取失败");
      }
      console.log(res.data);
      res.data.goods.forEach((item) => {
        item.add_time = this.timeData(item.add_time);
        // console.log(res.data);
      });
      this.goodList = res.data.goods;
      this.total = res.data.total;
    },
    //当前页显示多少数据
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getGoodList();
    },
    //当前处于第几页
    handleCurrentChange(newPagenum) {
      this.querInfo.pagenum = newPagenum;
      this.getGoodList();
    },
    //添加按钮
    goAddPage() {
      this.$router.push("/goods/add");
    },
    //删除商品
    async deleteGood(id) {
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
      const { data: res } = await this.$axios.delete(`goods/${id}`);
      if (res.meta.status !== 200) {
        return ElMessage.error("数据链接失败");
      }
      ElMessage.success("参数删除成功");
      //重新获得列表数据
      this.getGoodList();
    },
    //  编辑商品显示对话框
    editGood(id) {
      this.goodId = id;
      this.goodList.forEach((item) => {
        if (id === item.goods_id) {
          this.editForm = item;
        }
      });
      // console.log(this.editForm);
      // Object.assign(this.editForm, {goods_cat:0})
      this.getCatelist();
      console.log(this.goodList);
      this.editDialogVisible = true;
    },
    // 获取所有商品分类列表
    async getCatelist() {
      const { data: res } = await this.$axios.get("categories");
      if (res.meta.status !== 200) {
        return ElMessage.error("链接失败！");
      }
      this.cateList = res.data;
    },
    // 关闭对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //编辑提交
    editGoods() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        console.log(this.editForm);
        this.editForm.cat_id = this.selectCateKeys[0];
        this.editForm.cat_one_id = this.selectCateKeys[1];
        this.editForm.cat_two_id = this.selectCateKeys[2];
        Object.assign(this.editForm, {goods_cat:'0'})
        const { data: res } = await this.$axios.put(
          `goods/${this.editForm.goods_id}`,
          this.editForm
        );
        if (res.meta.status !== 200) {
          console.log(res.meta);
          return ElMessage.error("链接失败！");
        }
        ElMessage.success("修改成功！");
        this.editDialogVisible = false;
       this.getGoodList();
      });
    },
    //级联选择框变化是触发
    handleChange() {
      this.getParamsData();
    },
    getParamsData() {
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        return;
      }
      console.log(this.selectCateKeys);
    },
    //时间过滤器
    timeData(time) {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  computed: {},
};
</script>

<style lang="less" scoped>
</style>