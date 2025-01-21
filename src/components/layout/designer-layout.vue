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
    <header>头部</header>
    <aside>侧边</aside>
    <main>主体</main>
    <footer>底部</footer>
    <button @click="toggleDarkClass">切换</button>
  </div>
</template>
