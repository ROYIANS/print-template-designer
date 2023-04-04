<!--
* @description
* @filename TemplateViews.vue
* @author ROYIANS
* @date 2023/1/13 17:05
!-->
<template>
  <RoyModal v-if="visibleIn" :show.sync="visibleIn" height="80%" title="预设模板" width="70%">
    <roy-main class="TemplateViews">
      <div class="cards">
        <div v-for="(item, index) in templateData" :key="index" class="card">
          <div class="card__image-holder">
            <img :src="item.img" alt="wave" class="card__image" />
          </div>
          <div class="card__title">
            <div class="card__btn" @click="load(item.url)">
              <i class="ri-zoom-in-line"></i>
            </div>
            <h3>
              {{ item.title }}
              <small>{{ item.desp }}</small>
            </h3>
          </div>
        </div>
      </div>
    </roy-main>
  </RoyModal>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import RoyModal from '@/components/RoyModal/RoyModal'
import axios from 'axios'
import toast from '@/utils/toast'

axios.defaults.timeout = 180000
axios.defaults.baseURL = '/print-template-designer'
axios.defaults.withCredentials = false
axios.defaults.headers.post['Content-Type'] = 'application/json'

/**
 *
 */
export default {
  name: 'TemplateViews',
  mixins: [commonMixin],
  components: {
    RoyModal
  },
  props: {
    visible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visibleIn: false,
      templateData: [
        {
          url: '/templates/comp-purchase-template.rptd',
          img: 'https://s2.loli.net/2023/01/13/4iJbdwgy5rpI8em.png',
          title: '公司采购安排单',
          desp: '测试用'
        }
      ]
    }
  },
  methods: {
    initMounted() {},
    async load(url) {
      let res = await axios.get(url)
      if (res && res.data && res.data.componentData) {
        this.$emit('load', res.data)
      } else {
        toast('拉取模板失败')
      }
    }
  },
  created() {
    this.visibleIn = this.visible
  },
  mounted() {
    this.initMounted()
  },
  watch: {
    visibleIn(newVal) {
      this.$emit('update:visible', newVal)
    }
  }
}
</script>

<style lang="scss">
.TemplateViews {
  height: 100%;
  padding: 6px;

  .cards {
    margin: 8px;
    display: grid;
    grid-template-columns: repeat(3, auto);
    grid-gap: 5px;

    .card {
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      background: #ffffff;
      display: inline-block;
      margin: 8px;
      max-width: 300px;
      position: relative;
      text-align: left;
      transition: all 0.3s 0s ease-in;
      width: 300px;

      .card__image {
        max-width: 300px;
      }

      .card__image-holder {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.1);
      }

      .card__title {
        background: #ffffff;
        padding: 6px 15px 10px;
        position: relative;
        z-index: 0;
      }

      .card__btn {
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
        width: 30px;
        font-size: 14px;
        line-height: 30px;
        height: 30px;
        border-radius: 100%;
        background: #4579e1;
        text-align: center;
        color: #fff;
        cursor: pointer;
        position: absolute;
        right: 20px;
        top: 20px;

        &:hover {
          box-shadow: none;
          background: rgba(69, 121, 225, 0.84);
        }
      }
    }
  }
}
</style>
