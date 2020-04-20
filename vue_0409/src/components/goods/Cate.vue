<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template #order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template #opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类表单区域 -->
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 表单尾部提交区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
      <!-- 编辑分类表单区域 -->
      <el-form
        ref="editCateFormRef"
        :model="editCateForm"
        :rules="editCateFormRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 表单尾部提交区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 为Table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类对话框的显示隐藏
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 父级分类
        cat_pid: 0,
        // 分类等级
        cat_level: 0
      },
      // 添加分类表单规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器配置
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: 'true',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的ID
      selectedKeys: [],
      // 控制修改分类对话框的显示隐藏
      editCateDialogVisible: false,
      // 修改分类表单数据对象
      editCateForm: {
        cat_id: '',
        cat_name: ''
      },
      // 修改分类表单规则对象
      editCateFormRules: {
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
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // console.log(res.data)
      // 把数据列表赋值给catelist
      this.catelist = res.data.result
      this.total = res.data.total
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
    // 显示添加分类对话框
    showAddCateDialog() {
      // 先获取父级分类列表
      this.getParentCateList()
      // 再显示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级（前两级）分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 获取成功
      this.parentCateList = res.data
    },
    // 选中项发生变化触发
    parentCateChanged() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length !== 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类确定按钮
    addCate() {
      // console.log(this.addCateForm)
      // 预校验
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // // 添加成功
        this.$message.success(res.meta.msg)
        // // 关闭对话框
        this.addCateDialogVisible = false
        // 刷新分类列表
        this.getCateList()
      })
    },
    // 监听添加分类对话框关闭后的重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 监听修改分类对话框关闭的重置表单
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 显示修改分类对话框
    async showEditCateDialog(catId) {
      this.editCateDialogVisible = true
      const { data: res } = await this.$http.get('categories/' + catId)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.editCateForm = res.data
      }
      // console.log(res)
    },
    // 修改分类对话框确定
    editCate() {
      // 预校验
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, this.editCateForm)
        // 修改用户失败
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 修改成功
        this.$message.success(res.meta.msg)
        // 隐藏对话框
        this.editCateDialogVisible = false
        // 刷新分类列表
        this.getCateList()
      })
    },
    // 根据分类ID删除分类
    async removeCateById(catId) {
      // 弹框询问用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('categories/' + catId)
      // 删除用户失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 删除成功
      this.$message.success(res.meta.msg)
      // 刷新列表
      this.getCateList()
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
