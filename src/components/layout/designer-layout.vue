<script setup lang="ts">
defineOptions({
  name: 'PtdDesignerLayout',
})

const toggleDarkClass = () => {
  document.documentElement.classList.toggle('dark')
}
</script>

<template>
  <div class="r-container">
    <button @click="toggleDarkClass">切换</button>
    <header>头部</header>
    <aside>侧边</aside>
    <main>主体</main>
    <footer class="r-footer">
      <slot name="footer">
        <div>你好</div>
      </slot>
    </footer>
  </div>
</template>
