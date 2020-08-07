<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img
          src="../assets/zznu.png"
          alt=""
        >
        <span>电商后台管理系统</span>
      </div>
      <el-button
        type="info"
        @click="logout"
      >退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏导航区域 -->
        <div
          class="toggle_button"
          @click="toggleCollapse"
        >|||</div>
        <!-- unique-opened 是否只保持一个子菜单的展开  -->
        <!-- router 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="statePath"
        >
          <!-- 一级标题 -->
          <!-- index 接受字符串类似数字 -->
          <el-submenu
            :index="item.id + ''"
            :key="item.id"
            v-for='item in menuList'
          >
            <!-- 一级图标模板区域 -->
            <template slot="title">
              <!-- 字体图标 -->
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级标题 -->
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="'/' + subItem.path"
              @click="getNavState('/' + subItem.path)"
            >
              <!-- 二级图标模板区域 -->
              <template slot="title">
                <!-- 字体图标 -->
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单栏数据
      menuList: [],
      // 图标对象
      iconObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠菜单栏
      isCollapse: false,
      // 二级菜单激活链接
      statePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.statePath = window.sessionStorage.getItem('router')
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到dengluye
      this.$router.push('/login')
    },
    // 获取菜单栏数据
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // console.log(res)
      this.menuList = res.data
    },
    // 切换菜单栏折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态  二级菜单
    getNavState(statePath) {
      window.sessionStorage.setItem('router', statePath)
      this.statePath = statePath
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  // height: 80px !important;
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  > div {
    font-size: 20px;
    color: #fff;
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
    img {
      width: 55px;
      height: 55px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .toggle_button {
    background-color: #4a5064;
    font-size: 10px;
    color: #fff;
    text-align: center;
    line-height: 24px;
    cursor: pointer;
    letter-spacing: 0.2rem;
  }
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
</style>
