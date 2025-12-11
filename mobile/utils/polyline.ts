// ============================================
// Decode Google Polyline to coordinates
// ============================================

export const decodePolyline = (encoded: string): [number, number][] => {
/**
 * Decodes a Google Polyline encoded string to an array of coordinates.
 * @param {string} encoded - The Google Polyline encoded string.
 * @returns {[number, number][]} - An array of coordinates in the format [longitude, latitude] for Mapbox.
 */
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]); // [longitude, latitude] for Mapbox
  }

  return coordinates;
};
