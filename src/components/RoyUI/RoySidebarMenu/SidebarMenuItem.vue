<template>
  <component :is="item.component" v-if="item.component && !isItemHidden" v-bind="item.props" />
  <div
    v-else-if="item.header && !isItemHidden"
    :class="item.class"
    class="vsm--header"
    v-bind="item.attributes"
  >
    {{ item.title }}
  </div>
  <div
    v-else-if="!isItemHidden"
    :class="[{ 'vsm--item_open': show }]"
    class="vsm--item"
    @mouseout="mouseOutEvent"
    @mouseover="mouseOverEvent"
  >
    <sidebar-menu-link
      :class="itemLinkClass"
      :item="item"
      v-bind="itemLinkAttributes"
      @click.native="clickEvent"
    >
      <sidebar-menu-icon
        v-if="item.icon && !isMobileItem"
        :icon="active ? item.activeIcon || item.icon : item.icon"
      />
      <transition :appear="isMobileItem" name="fade-animation">
        <template v-if="(isCollapsed && !isFirstLevel) || !isCollapsed || isMobileItem">
          <span class="vsm--title">{{ item.title }}</span>
        </template>
      </transition>
      <template v-if="(isCollapsed && !isFirstLevel) || !isCollapsed || isMobileItem">
        <sidebar-menu-badge v-if="item.badge" :badge="item.badge" />
        <div
          v-if="itemHasChild"
          :class="[{ 'vsm--arrow_open': show }, { 'vsm--arrow_slot': $slots['dropdown-icon'] }]"
          class="vsm--arrow"
        >
          <slot name="dropdown-icon" />
        </div>
      </template>
    </sidebar-menu-link>
    <template v-if="itemHasChild">
      <template v-if="(isCollapsed && !isFirstLevel) || !isCollapsed || isMobileItem">
        <transition
          :appear="isMobileItem"
          name="expand"
          @afterEnter="expandAfterEnter"
          @beforeLeave="expandBeforeLeave"
          @enter="expandEnter"
        >
          <div
            v-if="show"
            :class="isMobileItem && 'vsm--dropdown_mobile-item'"
            :style="isMobileItem && mobileItemStyle.dropdown"
            class="vsm--dropdown"
          >
            <div class="vsm--list">
              <sidebar-menu-item
                v-for="(subItem, index) in item.child"
                :key="index"
                :is-collapsed="isCollapsed"
                :item="subItem"
                :level="level + 1"
                :rtl="rtl"
                :show-child="showChild"
              >
                <slot slot="dropdown-icon" name="dropdown-icon" />
              </sidebar-menu-item>
            </div>
          </div>
        </transition>
      </template>
    </template>
  </div>
</template>

<script>
import pathToRegexp from 'path-to-regexp'
import SidebarMenuLink from './SidebarMenuLink.vue'
import SidebarMenuIcon from './SidebarMenuIcon.vue'
import SidebarMenuBadge from './SidebarMenuBadge.vue'

export default {
  name: 'SidebarMenuItem',
  components: {
    SidebarMenuLink,
    SidebarMenuIcon,
    SidebarMenuBadge
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 1
    },
    isCollapsed: {
      type: Boolean
    },
    isMobileItem: {
      type: Boolean,
      default: false
    },
    mobileItem: {
      type: Object,
      default: null
    },
    activeShow: {
      type: Object,
      default: null
    },
    showChild: {
      type: Boolean,
      default: false
    },
    showOneChild: {
      type: Boolean,
      default: false
    },
    rtl: {
      type: Boolean,
      default: false
    },
    disableHover: {
      type: Boolean,
      default: false
    },
    mobileItemStyle: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      active: false,
      exactActive: false,
      itemShow: false,
      itemHover: false
    }
  },
  computed: {
    isFirstLevel() {
      return this.level === 1
    },
    show: {
      get() {
        if (!this.itemHasChild) {
          return false
        }
        if (this.showChild || this.isMobileItem) {
          return true
        }
        return this.itemShow
      },
      set(show) {
        if (this.showOneChild) {
          show ? this.emitActiveShow(this.item) : this.emitActiveShow(null)
        }
        this.itemShow = show
      }
    },
    itemLinkClass() {
      return [
        'vsm--link',
        !this.isMobileItem ? `vsm--link_level-${this.level}` : '',
        { 'vsm--link_mobile-item': this.isMobileItem },
        { 'vsm--link_hover': this.hover },
        { 'vsm--link_active': this.active },
        { 'vsm--link_exact-active': this.exactActive },
        { 'vsm--link_disabled': this.item.disabled },
        this.item.class
      ]
    },
    itemLinkAttributes() {
      const target = this.item.external ? '_blank' : '_self'
      const tabindex = this.item.disabled ? -1 : null

      return {
        target,
        tabindex,
        ...this.item.attributes
      }
    },
    isItemHidden() {
      if (this.isCollapsed) {
        if (this.item.hidden && this.item.hiddenOnCollapse === undefined) {
          return true
        } else {
          return this.item.hiddenOnCollapse === true
        }
      } else {
        return this.item.hidden === true
      }
    },
    hover() {
      if (this.isCollapsed && this.isFirstLevel) {
        return this.item === this.mobileItem
      }
      return this.itemHover
    },
    itemHasChild() {
      return !!(this.item.child && this.item.child.length > 0)
    }
  },
  watch: {
    $route() {
      setTimeout(() => {
        if (this.item.header || this.item.component) {
          return
        }
        this.initState()
      }, 1)
    },
    item(newItem, item) {
      this.emitItemUpdate(newItem, item)
    },
    'item.isActive'() {
      this.initState()
    },
    activeShow() {
      this.itemShow = this.item === this.activeShow
    }
  },
  created() {
    if (this.item.header || this.item.component) {
      return
    }
    this.initState()
  },
  mounted() {
    if (!this.$router) {
      window.addEventListener('hashchange', this.initState)
    }
  },
  destroyed() {
    if (!this.$router) {
      window.removeEventListener('hashchange', this.initState)
    }
  },
  methods: {
    isLinkActive(item) {
      return (
        item.isActive ||
        this.matchRoute(item) ||
        this.isChildActive(item.child) ||
        this.isAliasActive(item)
      )
    },
    isLinkExactActive(item) {
      return this.matchExactRoute(item.href)
    },
    isChildActive(child) {
      if (!child) {
        return false
      }
      return child.some((item) => {
        return this.isLinkActive(item)
      })
    },
    isAliasActive(item) {
      if (item.alias) {
        const current = this.$router
          ? this.$route.fullPath
          : window.location.pathname + window.location.search + window.location.hash
        if (Array.isArray(item.alias)) {
          return item.alias.some((alias) => {
            return pathToRegexp(alias).test(current)
          })
        } else {
          return pathToRegexp(item.alias).test(current)
        }
      }
      return false
    },
    matchRoute({ href, exactPath }) {
      if (!href) {
        return false
      }
      if (this.$router) {
        const { route } = this.$router.resolve(href)
        return exactPath ? route.path === this.$route.path : this.matchExactRoute(href)
      } else {
        return exactPath ? encodeURI(href) === window.location.pathname : this.matchExactRoute(href)
      }
    },
    matchExactRoute(href) {
      if (!href) {
        return false
      }
      if (this.$router) {
        const { route } = this.$router.resolve(href)
        return route.fullPath === this.$route.fullPath
      } else {
        return (
          encodeURI(href) ===
          window.location.pathname + window.location.search + window.location.hash
        )
      }
    },
    clickEvent(event) {
      if (this.item.disabled) {
        return
      }
      if (!this.item.href) {
        event.preventDefault()
      }

      this.emitItemClick(event, this.item, this)

      this.emitMobileItem(event, event.currentTarget.offsetParent)

      if (!this.itemHasChild || this.showChild || this.isMobileItem) {
        return
      }
      if (!this.item.href || this.exactActive) {
        this.show = !this.show
      }
    },
    emitMobileItem(event, itemEl) {
      if (this.hover) {
        return
      }
      if (!this.isCollapsed || !this.isFirstLevel || this.isMobileItem) {
        return
      }
      this.$emit('unset-mobile-item', true)
      setTimeout(() => {
        if (this.mobileItem !== this.item) {
          this.$emit('set-mobile-item', { item: this.item, itemEl })
        }
        if (event.type === 'click' && !this.itemHasChild) {
          this.$emit('unset-mobile-item', false)
        }
      }, 0)
    },
    initState() {
      this.initActiveState()
      this.initShowState()
    },
    initActiveState() {
      this.active = this.isLinkActive(this.item)
      this.exactActive = this.isLinkExactActive(this.item)
    },
    initShowState() {
      if (!this.itemHasChild || this.showChild) {
        return
      }
      if ((this.showOneChild && this.active && !this.show) || (this.active && !this.show)) {
        this.show = true
      } else if (this.showOneChild && !this.active && this.show) {
        this.show = false
      }
    },
    mouseOverEvent(event) {
      if (this.item.disabled) {
        return
      }
      event.stopPropagation()
      this.itemHover = true
      if (!this.disableHover) {
        this.emitMobileItem(event, event.currentTarget)
      }
    },
    mouseOutEvent(event) {
      event.stopPropagation()
      this.itemHover = false
    },
    expandEnter(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    expandAfterEnter(el) {
      el.style.height = 'auto'
    },
    expandBeforeLeave(el) {
      if (this.isCollapsed && this.isFirstLevel) {
        el.style.display = 'none'
        return
      }
      el.style.height = el.scrollHeight + 'px'
    }
  },
  inject: ['emitActiveShow', 'emitItemClick', 'emitItemUpdate']
}
</script>
