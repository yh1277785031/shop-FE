<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="showAddCateDialog"
          >添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 分类表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        show-index
        index-text='#'
        border
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效列 -->
        <template v-slot:isok='slotProps'>
          <i
            class="el-icon-success"
            style="color:lightgreen"
            v-if="slotProps.row.cat_deleted === false"
          ></i>
          <i
            class="el-icon-error"
            style="color:red"
            v-else
          ></i>
        </template>
        <!-- 排序列 -->
        <template v-slot:order='slotProps'>
          <el-tag
            size="mini"
            v-if="slotProps.row.cat_level === 0"
          >一级</el-tag>
          <el-tag
            type="warning"
            size="mini"
            v-else-if="slotProps.row.cat_level === 1"
          >二级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else
          >三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template v-slot:opt="slotProps">
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(slotProps.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(slotProps.row)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item
          label="分类名称："
          prop="cat_name"
        >
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择器 -->
          <!-- options 指定数据源   props 配置对象-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="cascaderChange"
            change-on-select
            clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addCate"
        >确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <span>
        <el-form
          :model="editCateFrom"
          :rules="editCateRules"
          ref="editCateRuleFormRef"
          label-width="100px"
        >
          <el-form-item
            label="分类名称"
            prop="cat_name"
          >
            <el-input v-model="editCateFrom.cat_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editCate()"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表请求参数
      queryInfo: {
        type: [3],
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表数据
      cateList: [],
      // 商品列表总数据条数
      total: 0,
      // 为tree-table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'opt'
        }
      ],
      // 添加分类对话框是否可见
      addCateDialogVisible: false,
      // 添加分类表单
      addCateForm: {
        // 添加的分类名称
        cat_name: '',
        // 父级分类的id'
        cat_pid: 0,
        // 分类的等级 默认一级
        cat_level: 0
      },
      // 添加分类表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器所选中数据
      selectedKeys: [],
      // 修改商品列表对话框
      editCateDialogVisible: false,
      // 修改分类表单
      editCateFrom: {
        cat_name: ''
      },
      // 修改分类表单验证规则
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      // 发起获取商品列表请求
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      console.log(res.data)
      // 为商品列表数据赋值
      this.cateList = res.data.result
      // 为商品列表总数据条数赋值
      this.total = res.data.total
      console.log(this.cateList)
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize

      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum

      this.getCateList()
    },
    // 添加分类点击事件
    showAddCateDialog() {
      // 获取父级分类列表
      this.getParentCateList()

      this.addCateDialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: {
          type: [2]
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级列表失败')
      }
      this.parentCateList = res.data
      console.log(res.data)
    },
    // 级联选择器值改变事件
    cascaderChange() {
      console.log(this.selectedKeys)
      // 判断父级分类id 与分类层级
      if (this.selectedKeys.length > 0) {
        // 父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 分类层级
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类点击
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()

        this.addCateDialogVisible = false
      })
    },
    // 添加分类对话框关闭，重置addCatefrom表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectedKeys = []
    },
    // 修改分类点击事件
    showEditDialog(cate) {
      this.editCateDialogVisible = true
      console.log(cate)
      this.editCateFrom = cate
    },
    // 修改分类
    editCate() {
      this.$refs.editCateRuleFormRef.validate(async validata => {
        if (!validata) {
          return
        }
        const { data: res } = await this.$http.put('/categories/' + this.editCateFrom.cat_id, {
          cat_name: this.editCateFrom.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.$message.success('修改分类成功')
        this.getCateList()

        this.editCateDialogVisible = false
      })
    },
    // 删除分类
    async deleteCate(cate) {
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(result)
      if (result === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 发起删除分类请求
      const { data: res } = await this.$http.delete('/categories/' + cate.cat_id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
