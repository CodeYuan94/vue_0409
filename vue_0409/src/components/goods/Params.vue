<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="cateChanged"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- Tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="only" :disabled="isBtnDisabled">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddParamsDialog"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template v-slot="scope">
                <!-- 标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="deleteAttrVals(i,scope.row)">{{item}}</el-tag>
                <!-- 文本框 -->
                <el-input
                  class="input-new-tag"
                  ref="saveTagInput"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="many" :disabled="isBtnDisabled">
          <!-- 添加属性按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddParamsDialog"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template v-slot="scope">
                <!-- 标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="deleteAttrVals(i,scope.row)">{{item}}</el-tag>
                <!-- 文本框 -->
                <el-input
                  class="input-new-tag"
                  ref="saveTagInput"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数的对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addParamsDialogVisible"
        width="30%"
        @close="addParamsDialogClosed"
      >
        <!-- 内容主体区域 -->
        <el-form
          ref="addParamFormRef"
          :model="addParamForm"
          :rules="addParamFormRules"
          label-width="80px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addParamForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParam">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数的对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editParamsDialogVisible"
        width="30%"
        @close="editParamsDialogClosed"
      >
        <!-- 内容主体区域 -->
        <el-form
          ref="editParamFormRef"
          :model="editParamForm"
          :rules="editParamFormRules"
          label-width="80px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editParamForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParam">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有分类列表
      cateList: [],
      // 选中的分类ID
      selectedKeys: [],
      // 级联选择器的配置属性
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: 'true',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // Tab激活的页签名
      activeName: 'only',
      // 动态参数数据
      onlyTableData: [],
      // 静态属性数据
      manyTableData: [],
      // 添加参数对话框的显示隐藏
      addParamsDialogVisible: false,
      // 添加参数表单数据对象
      addParamForm: {
        attr_name: ''
      },
      // 添加参数表单规则对象
      addParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名', trigger: 'blur' }
        ]
      },
      // 控制修改参数对话框的显示隐藏
      editParamsDialogVisible: false,
      // 修改参数表单数据对象
      editParamForm: {
        attr_id: '',
        attr_name: ''
      },
      // 修改参数表单规则对象
      editParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 获取成功
      this.cateList = res.data
    },
    // 监听级联选择器选中分类的改变
    cateChanged() {
      // 选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.activeName = 'only'
        return
      }
      // 选中的是三级分类
      // console.log(this.selectedKeys)
      // 根据分类ID和所处面板获取对应的参数
      this.getParamsData()
    },
    // tab页签点击后的处理函数
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 根据分类ID和所处面板获取对应的参数
    async getParamsData() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals !== '' ? item.attr_vals.split(',') : []
        // 控制文本框的显示隐藏
        item.inputVisible = false
        // 文本框的数据
        item.inputValue = ''
      })
      // 获取成功
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 显示添加参数对话框
    showAddParamsDialog() {
      this.addParamsDialogVisible = true
    },
    // 监听添加参数对话框的关闭
    addParamsDialogClosed() {
      // 重置表单
      this.$refs.addParamFormRef.resetFields()
    },
    // 添加参数确定按钮
    addParam() {
      // 预校验
      this.$refs.addParamFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // console.log(res)
        // 添加参数成功
        this.$message.success(res.meta.msg)
        // 关闭对话框
        this.addParamsDialogVisible = false
        // 刷新参数列表
        this.getParamsData()
      })
    },
    // 显示修改参数对话框
    async showEditParamsDialog(attrId) {
      // 根据分类ID和参数ID查询对应参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 查询成功
      this.editParamForm = res.data
      this.editParamsDialogVisible = true
    },
    // 监听修改参数对话框的关闭
    editParamsDialogClosed() {
      // 重置表单
      this.$refs.editParamFormRef.resetFields()
    },
    // 修改参数确定按钮
    editParam() {
      // 预校验
      this.$refs.editParamFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamForm.attr_id}`,
          {
            attr_name: this.editParamForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message(res.meta.msg)
        }
        // 修改成功
        this.$message.success(res.meta.msg)
        // 关闭对话框
        this.editParamsDialogVisible = false
        // 刷新参数列表
        this.getParamsData()
      })
    },
    // 根据分类ID和参数ID删除参数
    async removeParamById(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除此参数，是否继续？',
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
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 删除成功
      this.$message.success(res.meta.msg)
      // 刷新参数列表
      this.getParamsData()
    },
    // 文本框按下enter和失去焦点后触发的函数
    async handleInputConfirm(row) {
      // 如果输入数据不为空
      if (row.inputValue.trim().length !== 0) {
        // 增加当前的attr_vals
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 保存参数可选项
        this.saveAttrVals(row)
      }
      row.inputValue = ''
      row.inputVisible = false
    },
    // 控制文本框的显示
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 保存参数可选项
    async saveAttrVals(row) {
      // 发起修改参数请求
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 修改参数成功
      this.$message.success(res.meta.msg)
    },
    // 删除参数可选项
    deleteAttrVals(i, row) {
      row.attr_vals.splice(i, 1)
      // 保存
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，返回true,否则false
    isBtnDisabled() {
      return this.selectedKeys.length !== 3
    },
    // 当前选中的分类ID
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 添加参数的标题
    titleText() {
      if (this.activeName === 'only') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-cascader {
  margin-left: 15px;
}

.el-input {
  width: 150px;
}
</style>
