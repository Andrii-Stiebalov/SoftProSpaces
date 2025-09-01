<template>
  <article class="cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm
               hover:shadow-md transition-transform transform will-change-transform hover:-translate-y-0.5">
    <div
      class="h-36 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      Фото
    </div>

    <div class="mt-3 flex flex-col gap-2">
      <h3 class="text-sm font-semibold leading-tight text-gray-900 line-clamp-2">
        {{ property.title }}
      </h3>

      <div class="flex items-center justify-between text-xs text-gray-500">
        <div> {{ property.location }}</div>
        <div class="text-right">
          <div class="text-sm font-medium text-blue-700">₴ {{ property.price }}</div>
          <div class="text-xs text-gray-400">/ міс</div>
        </div>
      </div>

      <p class="mt-2 text-sm text-gray-600 line-clamp-3">
        {{ property.description }}
      </p>
    </div>
  </article>
</template>

<script lang="ts">
import type { Property } from '../types/index.type';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    property: {
      required: true,
      type: Object as () => Property
    },
  },
})
</script>