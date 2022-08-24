<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
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
  @clear="getOrderList"
>
  <template #append>
    <el-button @click="getOrderList">
      <el-icon><Search /></el-icon>
    </el-button>
  </template>
</el-input>
</el-col>
</el-row>
      <!-- 列表区域 -->
      <el-table
        :data="OrderList"
        style="width: 100%; margin-bottom: 20px"
        border
        stripe
      >
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编号"
          sortable
        ></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="100px"
        ></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100px">
          <template v-slot="scope">
            <el-tag
              type="danger"
              size="small"
              v-if="scope.row.pay_status == '0'"
              >未付款</el-tag
            >
            <el-tag type="success" size="small" v-else> 已付款 </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100px">
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="下单时间"
          width="200px"
        ></el-table-column>
        <el-table-column label="操作" width="120px">
          <template >
          <!-- 修改地址 -->
            <el-button type="primary" size="small"  @click="editOrder">
              <el-icon><Edit /></el-icon>
            </el-button>
            <!-- 查看物流进度按钮 -->
            <el-button type="success" size="small"  @click="showProgressBox">
              <el-icon><LocationFilled /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        :currentPage="querInfo.pagenum"
        :page-size="querInfo.pagesize"
        :page-sizes="[10, 15, 20, 30]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      v-model="addressDialogVisible"
      title="修改地址"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressFormRules"
        label-width="90px"
        @close="addressDialogClosed"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addressDialogVisible = false">确认</el-button>
        </span>
      </template>
    </el-dialog>

     <!-- 展示物流信息对话框 -->
 <el-dialog
   v-model="progressVisible"
   title="物流进度"
   width="50%"
 >
 <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time"
    >
      {{ activity.context }}
    </el-timeline-item>
  </el-timeline>
 </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";
import cityData from "./citydata.js";
export default {
  data() {
    return {
      querInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      OrderList: [],
      total: 0,
      addressForm: {
        address1: [],
        address2: "",
      },
      addressFormRules: {
        address1: [{ required: true, message: "请选择地区", trigger: "blur" }],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      addressDialogVisible: false,
      cityData: cityData,
            progressVisible:false,
            progressInfo:[
                {
        "time": "2018-05-10 09:39:00",
        "ftime": "2018-05-10 09:39:00",
        "context": "已签收,感谢使用顺丰,期待再次为您服务",
        "location": ""
      },
      {
        "time": "2018-05-10 08:23:00",
        "ftime": "2018-05-10 08:23:00",
        "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
        "location": ""
      },
      {
        "time": "2018-05-10 07:32:00",
        "ftime": "2018-05-10 07:32:00",
        "context": "快件到达 [北京海淀育新小区营业点]",
        "location": ""
      },
      {
        "time": "2018-05-10 02:03:00",
        "ftime": "2018-05-10 02:03:00",
        "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
        "location": ""
      },
      {
        "time": "2018-05-09 23:05:00",
        "ftime": "2018-05-09 23:05:00",
        "context": "快件到达 [北京顺义集散中心]",
        "location": ""
      },
      {
        "time": "2018-05-09 21:21:00",
        "ftime": "2018-05-09 21:21:00",
        "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
        "location": ""
      },
      {
        "time": "2018-05-09 13:07:00",
        "ftime": "2018-05-09 13:07:00",
        "context": "顺丰速运 已收取快件",
        "location": ""
      },
      {
        "time": "2018-05-09 12:25:03",
        "ftime": "2018-05-09 12:25:03",
        "context": "卖家发货",
        "location": ""
      },
      {
        "time": "2018-05-09 12:22:24",
        "ftime": "2018-05-09 12:22:24",
        "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
        "location": ""
      },
      {
        "time": "2018-05-08 21:36:04",
        "ftime": "2018-05-08 21:36:04",
        "context": "商品已经下单",
        "location": ""
      }
            ]
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$axios.get("orders", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        // console.log(res.meta);
        return ElMessage.error("链接失败");
      }
      res.data.goods.forEach((item) => {
        item.create_time = this.timeData(item.create_time);
        // console.log(res.data);
      });
      this.total = res.data.total;
      this.OrderList = res.data.goods;
      // console.log(this.OrderList);
    },
    // 显示修改地址对话框
    editOrder() {
      this.addressDialogVisible = true;
    },
     // 显示物流地址对话框

     showProgressBox() {
  // const { data: res } = await this.$axios.get(`/kuaidi/804909574412544580`);
  // if (res.meta.status !== 200) {
    // console.log(res.meta);
    // return ElMessage.error("链接失败");
  // }
  // console.log(res.data);
  this.progressVisible = true;
},
    //  监听修改地址对话框关闭
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    // 分页
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 下一页
    handleCurrentChange(newNum) {
      this.querInfo.pagenum = newNum;
      this.getOrderList();
    },
    // 时间过滤器
    timeData(time) {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
  },
};
</script>

<style lang="less" scoped>
</style>