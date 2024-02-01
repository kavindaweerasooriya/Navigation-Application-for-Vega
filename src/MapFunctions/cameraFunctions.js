//! moves to current location
const toCurrentLocation = (mapRef, serverCoordinatesRef) => {
  const currentCoordinates = serverCoordinatesRef.current;
  mapRef.current.flyTo({
    center: currentCoordinates,
    zoom: 14.8,
  });
};
export { toCurrentLocation };
