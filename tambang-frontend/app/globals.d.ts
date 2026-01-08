import * as L from 'leaflet';

declare module 'leaflet' {
  namespace GeometryUtil {
    function geodesicArea(latLngs: L.LatLng[]): number;
  }
}
