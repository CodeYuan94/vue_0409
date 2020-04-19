<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template v-slot="scope">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="6">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <el-row
                  :class="[i2===0?'':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <!-- 作用域插槽 -->
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input type="textarea" v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 表单尾部提交区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisable"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="角色名">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisable"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 内容主体区域 -->
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
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
      // 控制添加角色对话框的显示隐藏
      addDialogVisible: false,
      // 添加角色表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名的长度在3~10个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 5,
            max: 20,
            message: '角色描述的长度在5~20个字符',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改角色对话框的显示隐藏
      editDialogVisable: false,
      // 修改角色表单数据
      editForm: {
        roleId: '',
        roleDesc: ''
      },
      // 修改角色表单规则
      editFormRules: {
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 5,
            max: 20,
            message: '角色描述的长度在5~20个字符',
            trigger: 'blur'
          }
        ]
      },
      // 分配权限对话框的显示隐藏
      setRightDialogVisable: false,
      // 权限列表
      rightsList: [],
      // 树形权限的属性
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的权限
      defKeys: [],
      // 当前需要分配权限的角色ID
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 获取角色成功
      this.rolesList = res.data
      // console.log(res.data)
    },
    // 监听关闭添加角色对话框的表单重置
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    addRole() {
      // 表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 添加成功
        this.$message.success(res.meta.msg)
        // 隐藏对话框
        this.addDialogVisible = false
        // 刷新列表
        this.getRolesList()
      })
    },
    // 关闭修改角色对话框的表单重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 显示修改角色信息的对话框
    async showEditDialog(id) {
      this.editDialogVisable = true
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.editForm = res.data
      }
    },
    // 修改角色信息，预校验
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          this.editForm
        )
        console.log(res)
        // 修改角色失败
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 修改成功
        this.$message.success(res.meta.msg)
        // 隐藏对话框
        this.editDialogVisable = false
        // 刷新角色列表
        this.getRolesList()
      })
    },
    // 根据ID删除角色
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      // 删除用户失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 删除成功
      this.$message.success(res.meta.msg)
      // 刷新列表
      this.getRolesList()
    },
    // 根据ID删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      // 删除用户失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 删除成功
      this.$message.success(res.meta.msg)
      // 这里不刷新列表，重新给角色赋值新数据
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.setRightDialogVisable = true
      // 获取所有权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 获取成功
      this.rightsList = res.data
      // console.log(res.data)
      // 获取三级权限的ID
      this.getLeafNodes(role, this.defKeys)
      // 保存角色ID
      this.roleId = role.id
    },
    // 递归获取三级权限的ID，返回到defkeys
    getLeafNodes(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafNodes(item, arr))
    },
    // 关闭分配权限对话框后的重置默认选中权限
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 添加权限对话框的确定按钮
    async allotRights() {
      // 拿到全选和半选中状态的权限ID
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // 调用API
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 分配权限成功
      this.$message.success(res.meta.msg)
      // 隐藏对话框
      this.setRightDialogVisable = false
      // 刷新角色列表
      this.getRolesList()
    }
  }
}
</script>

<style>
.el-tag {
  margin: 7px;
}

.bdtop {
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
