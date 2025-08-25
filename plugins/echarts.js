import Vue from 'vue'

// 只在客户端导入 echarts
if (process.client) {
  const { use } = require('echarts/core')
  const { CanvasRenderer } = require('echarts/renderers')
  const { PieChart, GaugeChart } = require('echarts/charts')
  const { UniversalTransition } = require('echarts/features')
  const {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } = require('echarts/components')
  const VChart = require('vue-echarts')

  use([
    CanvasRenderer,
    PieChart,
    GaugeChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    UniversalTransition,
  ])

  // 全局注册 VChart 组件
  Vue.component('VChart', VChart.default || VChart)
}
