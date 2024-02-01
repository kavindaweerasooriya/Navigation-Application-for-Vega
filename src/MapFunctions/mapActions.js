// mapFunctions/mapActions.js

//! when reaching destination
const whenReachingDestination = (
  mapRef,
  markerRef,
  directionsLayerId,
  setExitsButtonVisible,
  setIsLabelVisible,
  setRenavigatingButtonVisible,
  clickedCoordinatesref,
  coordinatesRef,
  clickedMarkerRef,
  updateInterval,
  updateIntervalref,
  setRouteSteps,
  setCurrentStepIndex,
  setRemainingTime,
  locationMonitoringIntervalRef,
  clickedMarkerRef2
) => {
  console.log("Entering whenReachingDestination");
  const map = mapRef.current;
  const marker = markerRef.current;
  console.log("Exit");

  if (map.getLayer(directionsLayerId)) {
    map.removeLayer(directionsLayerId);
    map.removeSource(directionsLayerId);
  }
  setExitsButtonVisible(true);
  setIsLabelVisible(true);
  setRenavigatingButtonVisible(true);
  clickedCoordinatesref.current = null;
  coordinatesRef.current = null;
  if (clickedMarkerRef.current) {
    clickedMarkerRef.current.remove();
  }

  if (clickedMarkerRef2.current) {
    clickedMarkerRef2.current.remove();
  }
  console.log("updateInterval before clearInterval:", updateInterval);
  clearInterval(updateInterval);
  console.log("updateInterval after clearInterval:", updateInterval);
  clearInterval(updateIntervalref.current);
  setRouteSteps([]);
  setCurrentStepIndex(0);
  setRemainingTime(null);
  clearInterval(locationMonitoringIntervalRef);
  console.log("locaa");
};

export { whenReachingDestination };
