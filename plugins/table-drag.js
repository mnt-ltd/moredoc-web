import { throttle } from 'lodash'
import Vue from 'vue'

Vue.directive('table-drag', {
  inserted(el) {
    const tableBody = el.querySelector('.vxe-table--body-wrapper')
    if (!tableBody) return

    let startX = 0
    let startScrollLeft = 0
    let scrollLeft = 0
    let isDragging = false
    let deltaX = 0

    // 鼠标按下：初始化拖动
    tableBody.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return // 仅响应左键
      startX = e.clientX
      isDragging = true
      tableBody.style.cursor = 'grabbing'
      try {
        startScrollLeft = tableBody.scrollLeft
      } catch (error) {}
    })

    // 鼠标移动：计算位移并滚动
    tableBody.addEventListener(
      'mousemove',
      throttle(function (e) {
        if (!isDragging) return
        deltaX = e.clientX - startX
        if (deltaX !== 0) {
          tableBody.style.userSelect = 'none'
        }

        try {
          const headerWrapper = tableBody.previousElementSibling
          scrollLeft = startScrollLeft - deltaX
          const maxScroll = tableBody.scrollWidth
          if (scrollLeft >= maxScroll) {
            scrollLeft = maxScroll
          }

          if (scrollLeft < 0) {
            scrollLeft = 0
          }

          if (headerWrapper) {
            headerWrapper.scrollLeft = scrollLeft
          }
          tableBody.scrollLeft = scrollLeft
        } catch (error) {}
      }, 20)
    ) // 节流处理，避免频繁触发

    const clearDrag = function () {
      isDragging = false
      tableBody.style.cursor = 'default'
      tableBody.style.userSelect = ''
      startScrollLeft = scrollLeft
    }
    document.addEventListener('mouseup', clearDrag)
  },
})
