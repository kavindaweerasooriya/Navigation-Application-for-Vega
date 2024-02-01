//! This file contains functions related to route calculation and display
const calculateAndDisplayRoute = async (
  map,
  origin,
  destination,
  mapboxgl,
  setRouteSteps,
  setRemainingTime
) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const routeGeometry = data.routes[0].geometry;
      const newRouteSteps = data.routes[0].legs.reduce(
        (acc, leg) => acc.concat(leg.steps),
        []
      );
      const newRemainingTime = data.routes[0].duration;
      const newRemainingDistance = data.routes[0].distance;

      console.log("newRouteSteps", newRouteSteps);

      setRouteSteps(newRouteSteps);
      setRemainingTime(newRemainingTime);
      const originalModifier =
        data.routes[0].legs[0].steps[0].maneuver.modifier;
      console.log("originalModifier", originalModifier);

      const currentModifier = data.routes[0].modifier;
      console.log("currentModifier", currentModifier);

      const directionsLayerId = "directions";

      if (
        //! creatting a new route path
        !map.getLayer(directionsLayerId) &&
        !map.getSource(directionsLayerId)
      ) {
        map.addSource(directionsLayerId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: routeGeometry,
          },
        });

        map.addLayer({
          id: directionsLayerId,
          type: "line",
          source: directionsLayerId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      } else {
        //!updting the route path
        map.getSource(directionsLayerId).setData({
          type: "Feature",
          properties: {},
          geometry: routeGeometry,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching route data:", error);
  }
};

export { calculateAndDisplayRoute };
