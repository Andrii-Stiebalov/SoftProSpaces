<template>
  <div class="grow flex flex-col">
  <div class="flex w-full max-w-md pb-4 flex gap-2"> <input type="text" id="search" v-model="search"
      placeholder="Введіть назву або локацію..."
      class="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white transition-colors duration-200 sm:text-sm" />
    <button class="bg-sky-500 shadow-cyan-500/50 p-2 px-6 rounded-xl font-bold" @click="filter">
      <div class="fas fa-search"></div>
    </button>
  </div>
  <section class="w-full flex flex-col grow h-full">
    <div class="grow" v-if="this?.filteredProperties.length">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <PropertyListItem v-for="property in paginatedProperties" :key="property.id" :property="property"
          @click="() => onSelectProperty(property.id)" />
      </div>
    </div>
    <div v-else class="min-h-lvh"></div>
    <div class="flex justify-center gap-2 mt-6" v-if="totalPages"> <button
        class="px-3 py-1 rounded bg-sky-500 hover:bg-gray-300" :disabled="currentPage === 1" @click="currentPage--"> <i
          class="fa-solid fa-arrow-left"></i> </button> <span class="px-3 py-1 font-bold"> {{ currentPage }} / {{
            totalPages }} </span> <button class="px-3 py-1 rounded bg-sky-500 hover:bg-gray-300"
        :disabled="currentPage === totalPages" @click="currentPage++"> <i class="fa-solid fa-arrow-right"></i> </button>
    </div>
  </section>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import PropertyListItem from "../components/PropertyListItem.vue"; 
import { useRentStore } from "@/store/store"; 
interface state {
  search: string,
  currentPage: number,
  perPage: number
}
export default defineComponent({ 
  data() : state { 
    return { 
      search: "", 
      currentPage: 1, 
      perPage: 8, 
      }; 
    }, 
    components: { 
      PropertyListItem, 
      },
      watch: {
        search() {
          this.currentPage = 1;
        }
      },
      computed: { 
        totalPages() : number {
          return Math.ceil(this.filteredProperties.length / this.perPage);
        },
        properties()  { 
          return useRentStore().properties; 
        },
          
        filteredProperties() : any[] { 
          const query = this.search.toLowerCase().trim(); 
          if (!query) return this.properties; 
          return this.properties.filter((p) => p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query)); }, 
          otalPages() { return Math.ceil(this.filteredProperties.length / this.perPage); }, 
          paginatedProperties() { const start = (this.currentPage - 1) * this.perPage; 
          return this.filteredProperties.slice(start, start + this.perPage); }, }, 
          methods: { onSelectProperty(id: number) { this.$router.push(`/property/${ id }`); }, 
          filter() { this.currentPage = 1; 
          },
           }, 
          }); 
            </script>
