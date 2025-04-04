
// Global Type Definitions
declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

// Explicitly define Leaflet for TypeScript
declare module 'leaflet' {
  function map(element: HTMLElement | string, options?: any): Map;
  function tileLayer(urlTemplate: string, options?: any): any;
  function marker(latLng: [number, number] | any, options?: any): any;
  function divIcon(options: any): any;
  function featureGroup(layers?: any[]): any;
  
  namespace control {
    function layers(baseLayers?: any, overlays?: any, options?: any): any;
  }
  
  class LatLngBounds {
    extend(latLng: any): this;
  }
  
  class Map {
    setView(center: [number, number], zoom: number): this;
    remove(): void;
    addControl(control: any): this;
    fitBounds(bounds: any, options?: any): this;
  }
}

export {};
