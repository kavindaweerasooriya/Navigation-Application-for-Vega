let updateInterval;

//^* All the buttons and their functions are here 

//! starting navigation when start button is clicked
const handleStartButtonClick = (
  mapRef,
  markerRef,
  calculateAndDisplayRoute,
  setLocationMonitoringIntervalRef,
  setExitsButtonVisible,
  setIsLabelVisible,
  setRenavigatingButtonVisible,
  clickedCoordinatesref,
  coordinatesRef,
  updateInterval,
  updateIntervalref,
  locationMonitoringIntervalRef,
  setIsButtonVisible,
  serverCoordinatesRef,
  serverTrackRef,
  setIsUpdatingCamera,
  mapContainerRef,
  mapboxgl,
  setRouteSteps,
  setRemainingTime
) => {
  const map = mapRef.current;
  const marker = markerRef.current;
  setIsButtonVisible(true);
  setIsLabelVisible(false);
  setRenavigatingButtonVisible(false);

  setExitsButtonVisible(false);
  const updateCamera = () => {
    const currentCoordinates = serverCoordinatesRef.current;
    const currentTrack = serverTrackRef.current;

    map.easeTo({
      bearing: currentTrack,
      center: currentCoordinates,
      zoom: 16,
    });

    setIsUpdatingCamera(true);
  };

  updateInterval = setInterval(updateCamera, 1);

  updateIntervalref.current = updateInterval;

  locationMonitoringIntervalRef = setInterval(async () => {
    const updatedLocation = await getCurrentLocation(
      serverCoordinatesRef.current
    );

    //! updating route
    await calculateAndDisplayRoute(
      map,
      updatedLocation,
      coordinatesRef.current || clickedCoordinatesref.current,
      mapboxgl,
      setRouteSteps,
      setRemainingTime
    );
    console.log("Routr");
  }, 2000);
  setLocationMonitoringIntervalRef(locationMonitoringIntervalRef);

  mapContainerRef.current.addEventListener("click", () => {
    console.log("clicked on handleStartButtonClick");
    clearInterval(updateInterval);
    setIsUpdatingCamera(false);
  });

  return () => {
    clearInterval(locationMonitoringIntervalRef);
    map.remove();
  };
};

//! updating current location
const getCurrentLocation = async (origin1) => {
  return new Promise((resolve) => {
    const updatedLocation = [origin1[0], origin1[1]];
    resolve(updatedLocation);
  });
};

//! getting user clicked location
const handleMapClick = async (
  event,
  clickedCoordinatesref,
  coordinatesRef,
  mapboxgl,
  mapRef,
  setIsButtonVisible,
  clickedMarkerRef
) => {
  const clickedCoordinates = [event.lngLat.lng, event.lngLat.lat];

  //! checking if clicked location is within Sri Lanka
  const isWithinSriLanka =
    clickedCoordinates[0] >= 79.5 &&
    clickedCoordinates[0] <= 81.5 &&
    clickedCoordinates[1] >= 5.5 &&
    clickedCoordinates[1] <= 9.9;

  if (
    !clickedCoordinatesref.current &&
    isWithinSriLanka &&
    !coordinatesRef.current
  ) {
    console.log("clickCoordinatesref.current:", clickedCoordinatesref.current);
    clickedCoordinatesref.current = clickedCoordinates;
    console.log("clickedCoordinates:", clickedCoordinatesref.current);

    const markerForClicking = new mapboxgl.Marker()
      .setLngLat(clickedCoordinatesref.current)
      .addTo(mapRef.current);
    setIsButtonVisible(false);

    clickedMarkerRef.current = markerForClicking;
  }
};


//! exiting navigation when exit button is clicked
const handleExitButtonClick = (
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
  console.log("Entering handleReNavigating");
  const map = mapRef.current;
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

//! re-navigating when re-navigating button is clicked
const handleReNavigating = (
  mapRef,
  markerRef,
  serverCoordinatesRef,
  serverTrackRef,
  setIsUpdatingCamera,
  mapContainerRef,
  setRenavigatingButtonVisible,
  updateInterval
) => {
  const map = mapRef.current;
  const marker = markerRef.current;
  let locationMonitoringIntervalRef;
  setRenavigatingButtonVisible(false);

  const updateCamera = () => {
    const currentCoordinates = serverCoordinatesRef.current;
    const currentTrack = serverTrackRef.current;

    map.easeTo({
      bearing: currentTrack,
      center: currentCoordinates,
      zoom: 16,
    });
    setIsUpdatingCamera(true);
  };

  mapContainerRef.current.addEventListener("click", () => {
    console.log("clicked");
    console.log("updateInterval before clearInterval:", updateInterval);
    clearInterval(updateInterval);
    console.log("updateInterval after clearInterval:", updateInterval);
    setIsUpdatingCamera(false);
  });

  updateInterval = setInterval(updateCamera, 1);
};

export {
  handleExitButtonClick,
  handleReNavigating,
  handleMapClick,
  handleStartButtonClick,
};
