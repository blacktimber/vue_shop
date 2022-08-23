<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部警告部分 -->
      <el-alert
        show-icon
        title="添加商品信息"
        type="info"
        center
        :closable="false"
      ></el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="stepIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息" />
        <el-step title="商品参数" />
        <el-step title="商品属性" />
        <el-step title="商品图片" />
        <el-step title="商品内容" />
        <el-step title="完成" />
      </el-steps>
      <!-- tabs标签区域 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        lable-width="120px"
        :rules="addFormRules"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-col :span="15">
                <el-input v-model="addForm.goods_name" />
              </el-col>
            </el-form-item>
            <el-form-item label="商品价格 " prop="goods_price">
              <el-col :span="15">
                <el-input v-model="addForm.goods_price" type="number" />
              </el-col>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-col :span="15">
                <el-input v-model="addForm.goods_weight" />
              </el-col>
            </el-form-item>
            <el-form-item label="商品数量  " prop="goods_number">
              <el-col :span="15">
                <el-input v-model="addForm.goods_number" />
              </el-col>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat" width="120px">
              <el-col :span="5">
                <el-cascader
                  v-model="addForm.goods_cat"
                  :options="goodsCatList"
                  :props="cateProps"
                  @change="handleChange"
                />
              </el-col>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cd"
                  v-for="(cd, i) in item.attr_vals"
                  :key="i"
                  border
                />
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--  action 图片上传接口 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture-card"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button type="primary">上传图片</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <QuillEditor
              ref="myQuillEditor"
              theme="snow"
              v-model="addForm.goods_introduce"
              :options="editorOption"
            />
            <el-button type="primary" class="btnadd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" width="50%">
      <img :src="PreviewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import _ from "lodash";
export default {
  data() {
    return {
      activeIndex: "0",
      //添加商品表单
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      //商品分类列表
      goodsCatList: [],
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      //添加商品表单校验
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
        goods_cat: [
          {
            required: true,
            message: "请输入商品分类",
            trigger: "blur",
          },
        ],
      },
      //上传图片URL地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 预览图片临时地址
      PreviewPath: "",
      previewVisible: false,
      //富文本配置
      editorOption: {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ size: ["small", false, "large", "huge"] }],
            [{ font: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ header: 1 }, { header: 2 }],
            ["image"],
            [{ direction: "rtl" }], //文字编辑方向，从左到右还是从右到左
            [{ color: [] }, { background: [] }],
          ],
        },
        placeholder: "请输入内容...",
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get("categories");
      if (res.meta.status !== 200) {
        return ElMessage.error("链接失败！");
      }
      this.goodsCatList = res.data;
    },
    //级联选择器变化
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
      // console.log(this.addForm.goods_cat);
    },
    //标签页切换条件  填写内容
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        ElMessage.error("请选择商品分类");
        this.activeIndex = activeName;
        return false;
      }
    },
    //进入标签页
    async tabClicked() {
      //  console.log(this.activeIndex);
      if (this.activeIndex === "0") {
        //访问的是商品参数面板
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "many" } }
        );
        if (res.meta.status !== 200) {
          return ElMessage.error("链接失败！");
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        this.manyTableData = res.data;

        // console.log(this.manyTableData);
      } else if (this.activeIndex === "1") {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "only" } }
        );
        if (res.meta.status !== 200) {
          return ElMessage.error("链接失败！");
        }
        // console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.PreviewPath = file.response.data.url;
      this.previewVisible = true;
    },
    //移出图片处理
    handleRemove(file) {
      // 获取图片路径
      const filePath = file.response.data.tmp_path;
      // 得到图片索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });
      // 使用splice 移出图片地址
      this.addForm.pics.splice(i, 1);
      // console.log(this.addForm.pics);
    },
    // 保存图像到表单
    handleSuccess(response) {
      // console.log(response);
      //
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      // console.log(this.addForm.pics);
    },
    // 添加商品
     add() {
      this.$refs.addFormRef.validate(async(valid) => {
        if (!valid) {
          return ElMessage.error("请填写必要的表单项");
        }
        // 执行添加逻辑
        // lodash cloneDeep(obj) 深拷贝
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        
        //  处理静态参数和动态属性
        this.manyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') };
          this.addForm.attrs.push(newInfo);
        });
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });
       form.attrs= this.addForm.attrs
      //  console.log(form);
       const {data:res} =await this.$axios.post('goods',form)
       if(res.meta.status !== 201){
        console.log(res);
        return ElMessage.error('添加商品失败')
         
       }
       ElMessage.success('添加商品成功')
       this.$router.push('/goods')
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
    stepIndex() {
      return this.activeIndex;
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnadd {
  margin-top: 15px;
}
</style>>