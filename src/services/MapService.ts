import maplibregl, { Map, MapMouseEvent } from "maplibre-gl";
import type { MapGeoJSONFeature, LngLatLike, Popup } from "maplibre-gl";
import type { Router } from "vue-router";

export interface PropertyFeature extends GeoJSON.Feature<GeoJSON.Point, {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
}> {}

export class MapService {
  private map!: Map;
  private popup!: Popup;

  constructor(
    //@ts-ignore
    private containerId: string,
    //@ts-ignore
    private router: Router,
    //@ts-ignore
    private geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point, {
      id: number;
      title: string;
      description: string;
      price: number;
      location: string;
    }>
  ) {}

  public init() {
    this.map = new maplibregl.Map({
      container: this.containerId,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [30.5234, 50.4501] as LngLatLike,
      zoom: 6,
      //@ts-ignore
      projection: "mercator",
    });

    this.popup = new maplibregl.Popup({ closeButton: false, closeOnClick: true });

    this.map.on("load", () => {
      this.addSource();
      this.addLayer();
      this.addInteractions();
    });
  }

  private addSource() {
    this.map.addSource("places", {
      type: "geojson",
      data: this.geojsonData,
    });
  }

  private addLayer() {
    this.map.addLayer({
      id: "places-layer",
      type: "circle",
      source: "places",
      paint: {
        "circle-radius": 8,
        "circle-color": "#FF5722",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#FFFFFF",
      },
    });
  }

  private addInteractions() {
    // Click з плавним наближенням
    this.map.on(
      "click",
      "places-layer",
      (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feature = e.features?.[0];
        const id = feature?.properties?.id;
        //@ts-ignore
        const coords = feature?.geometry.coordinates as [number, number] | undefined;

        if (id && coords) {
          const onMoveEnd = () => {
            this.router.push(`/property/${id}`);
            this.map.off("moveend", onMoveEnd);
          };

          this.map.on("moveend", onMoveEnd);

          this.map.flyTo({
            center: coords,
            zoom: 14,
            speed: 1.5,
            curve: 1.1,
          });
        }
      }
    );

    // Hover / popup
    this.map.on(
      "mouseenter",
      "places-layer",
      (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;

        const props = feature.properties;

        this.popup
        //@ts-ignore
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(
            `<div class="text-black bg-white p-2 rounded shadow">
              <b>${props.title}</b><br>
              ${props.location}<br>
              ${props.price} грн<br>
              ${props.description}
            </div>`
          )
          .addTo(this.map);

        this.map.getCanvas().style.cursor = "pointer";
      }
    );

    this.map.on("mouseleave", "places-layer", () => {
      this.popup.remove();
      this.map.getCanvas().style.cursor = "";
    });
  }
}
