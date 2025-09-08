<template>
  <div class="min-h-screen flex flex-col relative">
    <header class="bg-white p-4 border-b flex items-center justify-between fixed top-0 left-0 right-0 z-1 rounded-b-lg shadow-xl">
      <RouterLink class="text-xl font-bold text-sky-400" :to="'/'" >SoftProSpaces</RouterLink>
    <div class="text-black flex gap-2">
    <RouterLink
      v-for="nav in navs"
      :key="nav.name"
      :to="{name: nav.name}"
      active-class="font-medium text-sky-400"
    >
      <div :class="`fas fa-${nav.title}`"></div>
      </RouterLink>
    </div>
    </header>

    <main class="p-4 mt-16 w-full flex flex-col">
      <RouterView />
    </main>

    <footer class="bg-gray-100 text-gray-700 p-4 text-center z-12">
      © 2025 SoftProSpaces
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'



export default defineComponent({
  name: 'DefaultLayout',
  data() {
    return {
      navs: [
        {
          title: 'home',
          name: 'Home',
        },
        {
          title: 'map',
          name: 'Map',
        },
      ]
    }
  }
})
</script>

<style >
main {
  min-height: calc(100vh - 63px);
}
</style>
