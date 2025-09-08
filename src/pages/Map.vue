<template>
  <div class="relative w-full grow">
  <div class="absolute inset-px" id="map">
  </div>
  </div>
</template> 

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useRentStore } from "@/store/store";
import { MapService } from "@/services/MapService";
import { useRouter } from "vue-router";


export default defineComponent({
  name: "MapView",
  setup() {
    const router = useRouter();
    const store = useRentStore();

    const geojsonData = {
      type: "FeatureCollection",
      features: store.properties.map((p) => ({
        type: "Feature",
        geometry: p.geometry,
        properties: {
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          location: p.location,
        },
      })),
    };

    onMounted(() => {
      //@ts-ignore
      const mapService = new MapService("map", router, geojsonData);
      mapService.init();
    });
  },
});
</script>


<style>
#map {
  position: absolute;
}

.maplibregl-canvas {
  position: absolute;
  border-radius: 20px;
}

.maplibregl-canvas-container {
  position: absolute;
  inset: 0;
}
</style>