<template>
  <div class="min-h-100% flex p-4 md:p-6 bg-gray-900 rounded-2xl">
    <div
      class="w-full flex flex-col md:flex-row gap-4 bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
    >
      <img
        class="w-full md:w-1/2 h-54 md:h-auto object-cover"
        src="https://arcon.com.ua/components/com_jshopping/files/img_products/full_Kievst_34_14.jpg"
        alt="Майно"
      />

      <div class="flex flex-col justify-between p-4 md:p-6 w-full md:w-1/2">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-gray-100">
            {{ property.title }}
          </h2>

          <p class="text-gray-300 mt-3 text-sm md:text-base leading-relaxed">
            {{ property.description }}
          </p>

          <div class="text-sm text-gray-400 mt-4">
            <div class="fas fa-location"></div> {{ property.location }}
          </div>
        </div>

        <div class="mt-6 md:mt-0">
          <div class="text-md font-semibold pb-1">
            <span class="font-bold text-2xl md:text-3xl text-blue-500">
              {{ formatPrice(property.price) }} ₴
            </span>
            <span class="text-gray-400">/ місяць</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRentStore } from "@/store/store";

export default defineComponent({
  name: "PropertyDetails",
  computed: {
    propertyId(): number {
      return Number(this.$route.params.id);
    },
    property(): {
      id: number;
      title: string;
      description: string;
      location: string;
      price: number;
    } {
      const store = useRentStore();
      //@ts-ignore
      return store.getById(this.propertyId);
    },
  },
  methods: {
    formatPrice(price: number): string {
      return new Intl.NumberFormat("uk-UA", {
        currency: "UAH",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(price);
    },
  },
});
</script>

