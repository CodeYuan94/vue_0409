<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getOrderList()"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template>
            <el-tooltip effect="dark" content="修改订单地址" placement="top" :enterable="false">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showAddress"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="查看物流进度" placement="top" :enterable="false">
              <el-button size="mini" type="success" icon="el-icon-location" @click="showProgress"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 修改订单地址的对话框 -->
    <el-dialog title="订单地址" :visible.sync="addressVisable" width="50%" @close="addressClosed">
      <!-- 内容主体区域 -->
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressFormRules"
        label-width="90px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData" :props="cascaderProp"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisable = false">取 消</el-button>
        <el-button type="primary" @click="addressVisable = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查询物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 内容主体区域 -->
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './cityData.js'

export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      orderlist: [],
      total: 0,
      addressVisable: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      cascaderProp: {
        expandTrigger: 'hover',
        value: 'code',
        label: 'name',
        children: 'sub'
      },
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    addressClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    showAddress() {
      this.addressVisable = true
    },
    async showProgress() {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.progressInfo = res.data
      this.progressVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
