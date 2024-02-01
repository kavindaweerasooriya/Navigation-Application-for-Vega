// StartNavigation.js
//! when starting navigation
export const handleStartButtonClick = (
  mapRef,
  markerRef,
  serverCoordinatesRef,
  serverTrackRef,
  mapContainerRef
) => {
  const map = mapRef.current;
  const marker = markerRef.current;

  const updateCamera = () => {
    const currentCoordinates = serverCoordinatesRef.current;
    const currentTrack = serverTrackRef.current;

    markerRef.current.setRotation(0);
    mapRef.current.setBearing(currentTrack);
    mapRef.current.setCenter(currentCoordinates);
    mapRef.current.setZoom(18);

    console.log(
      "currentCoordinates updating : " + currentCoordinates,
      "currentTrack:",
      currentTrack
    );
  };

  const updateInterval = setInterval(updateCamera, 1);

  mapContainerRef.current.addEventListener("click", () => {
    console.log("clicked");
    clearInterval(updateInterval);
  });
};
