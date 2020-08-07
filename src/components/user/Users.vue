<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加 -->
      <el-row :gutter="35">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="userInfo.query"
            clearable
            @clear="getUserList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="addDialogVisible = true"
          >添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table
        :data="userList"
        stripe
        border
      >
        <!-- 索引列 -->
        <el-table-column type="index">
        </el-table-column>
        <el-table-column
          label="姓名"
          prop="username"
        ></el-table-column>
        <el-table-column
          label="邮箱"
          prop="email"
        ></el-table-column>
        <el-table-column
          label="手机"
          prop="mobile"
        ></el-table-column>
        <el-table-column
          label="角色"
          prop="role_name"
        ></el-table-column>
        <el-table-column label="状态">
          <!-- 使用作用域插槽 -->
          <template v-slot="slotProps">
            <!-- {{slotProps.row}} 获取当前行数据 -->
            <el-switch v-model="slotProps.row.mg_state">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template
            v-slot="slotProps"
            width="170px"
          >
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size='mini'
              @click="showEditDialog(slotProps.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size='mini'
              @click="removeUser(slotProps.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size='mini'
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="dialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFromRules"
        ref="addFromRef"
        label-width="100px"
        :status-icon="true"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            v-model="addForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        >
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="adduser"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDailogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
        :status-icon="true"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="editForm.username"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item
          label="手机"
          prop="mobile"
        >
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editUserInfo"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱验证规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱地址'))
    }
    // 验证手机号规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[5678]|18[0-9]|[14[57]])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表参数
      userInfo: {
        // 查询参数
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页展示多少数据
        pagesize: 2
      },
      userList: [],
      // 总页数
      total: 0,
      // 添加用户对话框是否可见
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加yh表单验证规则
      addFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户对话框是否可见
      editDialogVisible: false,
      // 修改用户表单信息
      editForm: {},
      // 修改用户表单验证
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表请求
    async getUserList() {
      const { data: res } = await this.$http.get('/users', {
        params: this.userInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.errot(res.meta.msg)
      }
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      console.log(newSize)
      this.userInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.userInfo.pagenum = newPage
      this.getUserList()
    },
    // 关闭添加用户对话框事件
    dialogClosed() {
      // 重置添加用户表单
      this.$refs.addFromRef.resetFields()
    },
    // 添加新用户
    adduser() {
      this.$refs.addFromRef.validate(async validate => {
        if (!validate) return
        // 添加用户请求
        const { data: res } = await this.$http.post('/users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新加载用户列表
        this.getUserList()
      })
    },
    // 点击修改用户
    async showEditDialog(id) {
      // console.log(id)
      // 根据id查询用户信息
      const { data: res } = await this.$http.get('/users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      console.log(res.data)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭修改对话框时重置修改表单
    editDailogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async validate => {
        if (!validate) return
        // 发起修改用户信息请求
        const { data: res } = await this.$http.put('/users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('修改用户信息失败')
        // 隐藏对话框
        this.editDialogVisible = false
        // 重新加载用户列表
        this.getUserList()
        // 提示修改信息
        this.$message.success('修改用户信息成功')
      })
    },
    // 删除用户
    async removeUser(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // confirmResult 点击取消为cancel 点击确定为confirm
      // console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 发起删除用户请求
      const { data: res } = await this.$http.delete('/users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // 提示删除成功
      this.$message.success('删除用户成功')
      // 重新加载用户列表
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
