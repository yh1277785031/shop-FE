<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="addDialogVisible = true"
          >添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table
        :data="rolesList"
        border
        stripe
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="slotProps">
            <el-row
              :key="item1.id"
              v-for="(item1,i1) in slotProps.row.children"
              :class="['bdbottom',i1 === 0 ? 'bdTop':'','vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close='removeRightsByID(slotProps.row,item1.id)'
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 循环嵌套 -->
                <el-row
                  :key="item2.id"
                  v-for="(item2,i2) in item1.children"
                  :class="[i2 === 0 ?'':'bdTop','vcenter']"
                >
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close='removeRightsByID(slotProps.row,item2.id)'
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      :key="item3.id"
                      v-for="(item3) in item2.children"
                      @close='removeRightsByID(slotProps.row,item3.id)'
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          label="#"
        ></el-table-column>
        <el-table-column
          label="角色名称"
          prop="roleName"
        ></el-table-column>
        <el-table-column
          label="角色描述"
          prop="roleDesc"
        ></el-table-column>
        <el-table-column
          label="操作"
          width="400px"
        >
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(slotProps.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeRoles(slotProps.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="shouSetRightsDialog(slotProps.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加角色表单 -->
      <el-form
        :model="addRolesFrom"
        :rules="addRolesFromRules"
        ref="addRolesFromRef"
        label-width="100px"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input v-model="addRolesFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="roleDesc"
        >
          <el-input v-model="addRolesFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addRoles"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改角色表单 -->
      <el-form
        :model="editRolesFrom"
        :rules="editRolesRules"
        ref="editRolesFromRef"
        label-width="100px"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input v-model="editRolesFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="roleDesc"
        >
          <el-input v-model="editRolesFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editRoles"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRirhtsdialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        ref="rightsTreeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
      ></el-tree>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="setRirhtsdialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="allotRights"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 添加角色对话框可见
      addDialogVisible: false,
      // 添加角色表单
      addRolesFrom: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则
      addRolesFromRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 修改角色对话框可见
      editDialogVisible: false,
      // 修改角色表单
      editRolesFrom: {},
      // 修改角色验证规则
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 分配权限对话框可见
      setRirhtsdialogVisible: false,
      // 所有权限数据
      rightsList: [],
      // 树形控件绑定属性对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中控件
      defaultKeys: [],
      // 当前选中的控件
      currentKeys: '',
      // 当前角色id
      roleID: 0
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data

      console.log(this.rolesList)
    },
    // 关闭添加角色对话框
    addDialogClosed() {
      // 重置表单
      this.$refs.addRolesFromRef.resetFields()
    },
    // 添加角色
    addRoles() {
      this.$refs.addRolesFromRef.validate(async validate => {
        if (!validate) return
        // 添加角色
        const { data: res } = await this.$http.post('/roles', this.addRolesFrom)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        // 关闭添加角色对话框
        this.addDialogVisible = false
        this.$message.success('添加角色成功')
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 修改角色按钮
    async showEditDialog(id) {
      this.editDialogVisible = true
      // 查询角色
      const { data: res } = await this.$http.get('/roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败')
      }
      this.editRolesFrom = res.data
    },
    // 修改角色
    editRoles() {
      this.$refs.editRolesFromRef.validate(async validate => {
        if (!validate) return
        // 修改角色信息
        const { data: res } = await this.$http.put('/roles/' + this.editRolesFrom.roleId, {
          roleName: this.editRolesFrom.roleName,
          roleDesc: this.editRolesFrom.roleDesc
        })
        // console.log(this.editRolesFrom)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.editDialogVisible = false
        this.$message.success('修改角色成功')
        // 重新加载角色列表
        this.getRolesList()
      })
    },
    // 关闭修改对话框，重置表单
    editDialogClosed() {
      this.$refs.editRolesFromRef.resetFields()
    },
    // 删除角色
    async removeRoles(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 发起删除角色请求
      const { data: res } = await this.$http.delete('/roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      // 重新加载角色列表
      this.getRolesList()
    },
    // 删除权限
    async removeRightsByID(role, rightId) {
      // 弹出框确认删除操作
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发起删除权限请求
      const { data: res } = await this.$http.delete('/roles/' + role.id + '/rights/' + rightId)
      if (res.meta.status !== 200) {
        return this.$message.error('取消权限失败')
      }
      // 页面渲染
      role.children = res.data
    },
    // 分配权限对话框
    async shouSetRightsDialog(role) {
      // 保存当前角色id
      this.roleID = role.id
      // 获取权限列表数据
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 存储所有权限数据
      this.rightsList = res.data
      console.log(this.rightsList)
      // 递归获取三级权限节点
      this.getLeafKeys(role, this.defaultKeys)
      this.setRirhtsdialogVisible = true
    },
    // 递归获取当前角色所有三级权限id，保存到defaultKeys默认选中控件中
    getLeafKeys(node, arr) {
      // 没有children则为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限关闭事件
    setRightDialogClosed() {
      this.defaultKeys = []
    },
    // 分配权限
    async allotRights() {
      // 获取选中节点
      // console.log(this.$refs.rightsTreeRef.getCheckedNodes())
      // 获取选中node-key
      // console.log(this.$refs.rightsTreeRef.getCheckedKeys())
      // 获取半选中node-key
      // console.log(this.$refs.rightsTreeRef.getHalfCheckedKeys())
      const keys = [this.$refs.rightsTreeRef.getHalfCheckedKeys(), this.$refs.rightsTreeRef.getCheckedKeys()]
      // console.log(keys.toString())
      const idstr = keys.toString()
      const { data: res } = await this.$http.post('/roles/' + this.roleID + '/rights', {
        rids: idstr
      })
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败')
      }
      // 分配成功
      this.$message.success('分配权限成功')
      // 获取角色列表
      this.getRolesList()
      this.setRirhtsdialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.bdTop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
