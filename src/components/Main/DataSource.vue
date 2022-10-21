<!--
* @description 数据源
* @filename DataSource.vue
* @author ROYIANS
* @date 2022/10/21 9:16
!-->
<template>
  <el-main class="DataSource"> 1 </el-main>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'

/**
 * 数据源
 */
export default {
  name: 'DataSource',
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  methods: {
    initMounted() {}
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss">
.DataSource {
  height: 100%;
  padding: 6px;
}
</style>
