
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
  function latLngBounds(): LatLngBounds;
  function latLng(lat: number, lng: number): any;
  function icon(options: any): any;
  
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
    on(event: string, callback: Function): this;
    invalidateSize(options?: boolean | any): this;
  }
}

// Backend API URL
declare const API_BASE_URL: string;

// Python backend server URL type
interface APIConfig {
  baseURL: string;
}

// User type definition
type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
};

export {};
