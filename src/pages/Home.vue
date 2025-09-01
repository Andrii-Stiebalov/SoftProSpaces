<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import PropertyListItem from "../components/PropertyListItem.vue";
import { useRentStore } from "@/store/store";
import type { Property } from '../types/index.type';

export default defineComponent({
  name: "PropertyList",
  components: { PropertyListItem },
  setup() {
    const search = ref("");
    const currentPage = ref(1);
    const perPage = ref(8);
    const store = useRentStore();
    //@ts-ignore
    const properties = computed<Property[]>(() => store.properties);

    const filteredProperties = computed<Property[]>(() => {
      const query = search.value.toLowerCase().trim();
      if (!query) return properties.value;
      return properties.value.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    });

    const totalPages = computed<number>(() =>
      Math.ceil(filteredProperties.value.length / perPage.value)
    );

    const paginatedProperties = computed<Property[]>(() => {
      const start = (currentPage.value - 1) * perPage.value;
      return filteredProperties.value.slice(start, start + perPage.value);
    });

    watch(search, () => (currentPage.value = 1));

    const onSelectProperty = (id: number) => {
      // @ts-ignore
      router.push(`/property/${id}`);
    };

    const filter = () => {
      currentPage.value = 1;
    };

    return {
      search,
      currentPage,
      perPage,
      properties,
      filteredProperties,
      totalPages,
      paginatedProperties,
      onSelectProperty,
      filter,
    };
  },
});
</script>
