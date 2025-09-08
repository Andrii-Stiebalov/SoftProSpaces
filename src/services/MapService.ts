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
  private program!: WebGLProgram;
  private a_pos!: number;
  private u_matrix!: WebGLUniformLocation | null;
  private u_time!: WebGLUniformLocation | null;
  private buffer!: WebGLBuffer;
  private vertCount!: number;
  private mapInstance!: Map;

  constructor(
    private containerId: string,
    private router: Router,
    private geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point, {
      id: number;
      title: string;
      description: string;
      price: number;
      location: string;
    }>
  ) {}

  public init() {
    console.log("Initializing map with container:", this.containerId);
    this.map = new maplibregl.Map({
      style: `https://tiles.openfreemap.org/styles/bright`,
      center: [30.5234, 50.4501],
      zoom: 15.5,
      pitch: 0, // 2D view for debugging
      bearing: 0,
      container: this.containerId,
      antialias: true
    });

    this.map.on('styleimagemissing', (e) => {
      console.warn(`Missing image: ${e.id}`);
      const img = new Image(16, 16);
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAB5JREFUOE9jZKAQMOLr8f8/AwMDEwPD////Z8AGAF0/A3fW/0QAAAAAAElFTkSuQmCC';
      this.map.addImage(e.id, img);
    });

    this.map.on('load', () => {
      console.log("Map loaded, adding layers and sources");
      const layers = this.map.getStyle().layers;
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      this.map.addSource('openfreemap', {
        url: `https://tiles.openfreemap.org/planet`,
        type: 'vector',
      });

      this.map.addLayer({
        'id': '3d-buildings',
        'source': 'openfreemap',
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'minzoom': 15,
        'filter': ['all', ['!=', ['get', 'hide_3d'], true], ['has', 'render_height']],
        'paint': {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'render_height'], 0],
            0, 'lightgray',
            200, 'royalblue',
            400, 'lightblue'
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            16, ['coalesce', ['get', 'render_height'], 0]
          ],
          'fill-extrusion-base': [
            'case',
            ['>=', ['get', 'zoom'], 16],
            ['coalesce', ['get', 'render_min_height'], 0],
            0
          ]
        }
      }, labelLayerId);

      this.addSource();
      this.addLayer();
      // this.addWebGl();
      this.addInteractions();
    });

    this.popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
      anchor: "top",
      offset: [0, -30]
    });
  }

  private addSource() {
    console.log("Adding GeoJSON source: places");
    this.map.addSource("places", {
      type: "geojson",
      data: this.geojsonData,
    });
  }

  private addLayer() {
    console.log("Adding layer: places-layer");
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
    console.log("Setting up map interactions");
    this.map.on("click", "places-layer", (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      const feature = e.features?.[0];
      const id = feature?.properties?.id;
      const coords = feature?.geometry.coordinates as [number, number] | undefined;

      if (id && coords) {
        console.log("Clicked place with ID:", id, "at coords:", coords);
        const onMoveEnd = () => {
          console.log("Map flyTo complete, navigating to property:", id);
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
    });

    this.map.on("click", "3d-buildings", (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const buildingId = feature.properties.osm_id ?? feature.properties.id;
      console.log("Clicked 3D building with ID:", buildingId);
      if (!this.map.getLayer("highlighted-building")) {
        this.map.addLayer({
          id: "highlighted-building",
          source: "openfreemap",
          "source-layer": "building",
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": "yellow",
            "fill-extrusion-height": ["coalesce", ["get", "render_height"], 0],
            "fill-extrusion-opacity": 0.8
          },
          filter: ["==", "osm_id", buildingId]
        });
      } else {
        this.map.setFilter("highlighted-building", ["==", "osm_id", buildingId]);
      }
    });

    this.map.on("mouseenter", "places-layer", (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      const feature = e.features?.[0];
      if (!feature || !feature.properties) return;

      const props = feature.properties;
      console.log("Hovering over place:", props.title);
      this.popup
        .setLngLat(feature.geometry.coordinates as [number, number])
        .setHTML(
          `<div class="text-black bg-white p-2 px-3 rounded-xl shadow">
            <b>${props.title}</b><br>
            ${props.location}<br>
            ${props.price} грн<br>
            ${props.description}
          </div>`
        )
        .addTo(this.map);

      this.map.getCanvas().style.cursor = "pointer";
    });

    this.map.on("mouseleave", "places-layer", () => {
      console.log("Mouse left places-layer, removing popup");
      this.popup.remove();
      this.map.getCanvas().style.cursor = "";
    });
  }

  private compileShader(gl: WebGLRenderingContext, src: string, type: number): WebGLShader | null {
    console.log("Compiling shader:", type === gl.VERTEX_SHADER ? "Vertex" : "Fragment");
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
      return null;
    }
    console.log("Shader compiled successfully");
    return shader;
  }

  private createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    console.log("Creating WebGL program");
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return null;
    }
    console.log("WebGL program linked successfully");
    return program;
  }

  private createVertexBuffer(gl: WebGLRenderingContext): { buffer: WebGLBuffer, vertCount: number } {
    console.log("Creating vertex buffer");
    const coords = [
      [30.5234, 50.4501],
      [30.5244, 50.4501],
      [30.5234, 50.4511]
    ];
    console.log("Input coordinates (lng, lat):", coords);
    const merc = coords.map((c) => maplibregl.MercatorCoordinate.fromLngLat({ lng: c[0], lat: c[1] }));
    const verts = [
      merc[0].x, merc[0].y,
      merc[1].x, merc[1].y,
      merc[2].x, merc[2].y
    ];
    console.log("Mercator vertices:", verts);

    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    console.log("Vertex buffer created with", verts.length / 2, "vertices");

    return { buffer, vertCount: verts.length / 2 };
  }

  private initializeWebGLContext(gl: WebGLRenderingContext) {
    console.log("Initializing WebGL context");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    console.log("WebGL context initialized: blend enabled, depth test disabled");
  }

  private addWebGl() {
    console.log("Adding custom WebGL layer with animated shader");
    this.map.addLayer({
      id: 'custom',
      type: 'custom',
      renderingMode: '2d',
      onAdd: (map, gl) => {
        const vsSource = `
          attribute vec2 a_pos;
          uniform mat4 u_matrix;
          varying vec2 v_pos;
          void main() {
            gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
            v_pos = a_pos;
          }`;
        const fsSource = `
        precision highp float;
uniform float u_time;
varying vec2 v_pos;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
        mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = v_pos * 10.0 + vec2(u_time * 0.1, u_time * 0.05); // Animate clouds
    float n = fbm(uv); // Fractional Brownian Motion for cloud texture
    float cloud = smoothstep(0.2, 0.8, n); // Shape clouds with smoothstep
    vec3 skyColor = vec3(0.1, 0.5, 0.8); // Blue sky background
    vec3 cloudColor = vec3(1.0, 1.0, 1.0); // White clouds
    vec3 color = mix(skyColor, cloudColor, cloud); // Blend sky and clouds
    gl_FragColor = vec4(color, 0); // Semi-transparent
}`;

        const vertexShader = this.compileShader(gl, vsSource, gl.VERTEX_SHADER)!;
        const fragmentShader = this.compileShader(gl, fsSource, gl.FRAGMENT_SHADER)!;
        this.program = this.createProgram(gl, vertexShader, fragmentShader)!;

        this.a_pos = gl.getAttribLocation(this.program, "a_pos");
        this.u_matrix = gl.getUniformLocation(this.program, "u_matrix");
        this.u_time = gl.getUniformLocation(this.program, "u_time");

        const coords = [
          [30.5234, 50.4501],
          [30.5244, 51.4501],
          [30.5234, 0.4511],
          [0.5544, 50.4811]
        ];
        const merc = coords.map(c => maplibregl.MercatorCoordinate.fromLngLat({ lng: c[0], lat: c[1] }));
        const verts = new Float32Array([
          merc[0].x, merc[0].y,
          merc[1].x, merc[1].y,
          merc[2].x, merc[2].y,
          merc[3].x, merc[3].y
        ]);

        this.buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        this.vertCount = 4;

        this.initializeWebGLContext(gl);
      },
      render: (gl, matrix) => {
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.a_pos);
        gl.vertexAttribPointer(this.a_pos, 2, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(this.u_matrix, false, matrix.defaultProjectionData.mainMatrix);
        gl.uniform1f(this.u_time, performance.now() / 1000.0); // Pass current time in seconds
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertCount);
      }
    });
  }
}