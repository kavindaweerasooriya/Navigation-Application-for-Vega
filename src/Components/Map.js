import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import airportIconUrl from "../Assets/car_Icon.png";
import navigation from "../Assets/gps.png";
import stop_navigation from "../Assets/stop_navigation21.png";
import currentLocationMarker from "../Assets/currentLocation.png";
import { whenReachingDestination } from "../MapFunctions/mapActions";
import { toCurrentLocation } from "../MapFunctions/cameraFunctions";
import { calculateAndDisplayRoute } from "../MapFunctions/routeFunctions";
import {
  handleReNavigating,
  handleExitButtonClick,
  handleStartButtonClick,
  handleMapClick,
} from "../MapFunctions/mapClickHandlers";
import {
  formatRemainingTime,
  formatExpectedArrival,
} from "../MapFunctions/timerFunctions";
import "./Map.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidmVnYWlubm92YXRpb25zIiwiYSI6ImNsbTV3c3hwZDA4ZDgzcGxna2IxbDZtNXMifQ.eVpetpE1_nHx3K-LRMPb0g";

const Map = () => {
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const serverCoordinatesRef = useRef(null);
  const serverTrackRef = useRef(null);
  const coordinatesRef = useRef(null);
  const speedRef = useRef(null);
  const directionsLayerId = "directions";
  const mapRef = useRef(null);
  const clickedCoordinatesref = useRef(null);
  const clickedMarkerRef = useRef(null);
  const clickedMarkerRef2 = useRef(null);
  const updateIntervalref = useRef(null);

  const [currentLocation, setCurrentLocation] = useState([80.7718, 7.8731]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [mapRotation, setMapRotation] = useState(0);
  const [locationMonitoringIntervalRef, setLocationMonitoringIntervalRef] =
    useState(null);
  const [routeSteps, setRouteSteps] = useState([]);

  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isExitButtonVisible, setExitsButtonVisible] = useState(true);
  const [isFindClickedLocation, setFindClickedLocation] = useState(true);
  const [isLabelVisible, setIsLabelVisible] = useState(true);
  const [isUpdatingCamera, setIsUpdatingCamera] = useState(false);
  const [isLocationReached, setIsLocationReached] = useState(false);
  const [isRenavigatingButtonVisible, setRenavigatingButtonVisible] =
    useState(true);

  let markerIntervalId;

   //^* All the geoservice related functions are in this folder
  
  useEffect(() => {
    const updateMap = async () => {
      //!Getting GPS data from the /data end point
      try {
        const response = await fetch("http://localhost:3001/data");
        const data = await response.json();

        if (data && data.data && data.data.latitude && data.data.longitude) {
          setCurrentLocation([data.data.longitude, data.data.latitude]);
          serverCoordinatesRef.current = [
            data.data.longitude,
            data.data.latitude,
          ];
          const track = data.data.track || 0;
          serverTrackRef.current = track;
          setRotationAngle(track);
          const speed = data.data.speed;
          speedRef.current = data.data.speed;
        }
      } catch (error) {
        console.error("Error fetching GPS data:", error);
      }
    };

    //!updating GPS data every 500ms
    const gpsDataIntervalId = setInterval(updateMap, 500); 

    return () => {
      clearInterval(gpsDataIntervalId);
    };
  }, []);

  let updateInterval;

  useEffect(() => {
    //!loading the map
    let marker = markerRef.current;

    if (!markerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        // style: 'mapbox://styles/vegainnovations/cln9zh9ld03h701pb7jxcdbr1',
        style: "mapbox://styles/mapbox/outdoors-v12", //!mapbox style
        zoom: 2,
        center: currentLocation,
        attributionControl: false,
      });

      //! inbuild map zoom control and copass
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current = map;
      setFindClickedLocation(false);

      const geocoder = new MapboxGeocoder({
        //!serachbox cofinguration with tuning to Sri lanka
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: "LK",
        types: "country,region,postcode,place,locality,address,poi",
        marker: false,
      });

      //!searchbox configuration with tuning to USA and this is working correctly
      // const geocoder = new MapboxGeocoder({ // to USA
      //   accessToken: mapboxgl.accessToken,
      //   mapboxgl: mapboxgl,
      //   countries: 'US',
      //   types: 'country,region,postcode,place,locality,address,poi',
      //   marker: true,
      // })

      //!searchbox result handling
      geocoder.on("result", (event) => {
        console.log("updateInterval before clearInterval:", updateInterval);
        clearInterval(updateInterval);
        console.log("updateInterval after clearInterval:", updateInterval);
        clearInterval(updateIntervalref.current);
        setRouteSteps([]);
        setCurrentStepIndex(0);
        setRemainingTime(null);
        clearInterval(locationMonitoringIntervalRef);
        console.log("locaa");

        const { geometry } = event.result;
        const coordinates = geometry.coordinates;
        coordinatesRef.current = coordinates;
        setIsButtonVisible(false);
        setExitsButtonVisible(true);
        setIsLabelVisible(true);
        setRenavigatingButtonVisible(true);
        clickedCoordinatesref.current = null;
        const markerForClicking = new mapboxgl.Marker()
          .setLngLat(coordinatesRef.current)
          .addTo(mapRef.current);
        clickedMarkerRef2.current = markerForClicking;

        if (locationMonitoringIntervalRef) {
          // clickedCoordinatesref.current = null;
          clearInterval(locationMonitoringIntervalRef);
        }

        if (clickedMarkerRef.current) {
          clickedMarkerRef.current.remove();
          coordinatesRef.current = null;
          setRemainingTime(null);
        }

        if (map.getLayer(directionsLayerId)) {
          map.removeLayer(directionsLayerId);
          map.removeSource(directionsLayerId);
        }
      });

      //!searchbox clear handling
      geocoder.on("clear", () => {
        if (map.getLayer(directionsLayerId)) {
          map.removeLayer(directionsLayerId);
          map.removeSource(directionsLayerId);
        }
        setIsButtonVisible(true);
        setExitsButtonVisible(true);
        setIsLabelVisible(true);
        setRenavigatingButtonVisible(true);
        clickedCoordinatesref.current = null;
        coordinatesRef.current = null;
        if (clickedMarkerRef2.current) {
          clickedMarkerRef2.current.remove();
        }

        setRouteSteps([]);
        setCurrentStepIndex(0);
        setRemainingTime(null);
        clearInterval(locationMonitoringIntervalRef);
        console.log("locaa");
      });


      //! When user clicks on the map handleMapClick function will be called
      map.on("click", (event) => {
        const currentZoom = map.getZoom();

        if (!clickedCoordinatesref.current && currentZoom >= 11) {
          console.log(
            "clickedCoordinatesref.current:",
            clickedCoordinatesref.current
          );
          handleMapClick(
            event,
            clickedCoordinatesref,
            coordinatesRef,
            mapboxgl,
            mapRef,
            setIsButtonVisible,
            clickedMarkerRef
          );
        } else {
          console.log("Zoom level ", currentZoom);
          console.log(isExitButtonVisible);
        }
      });

      map.addControl(geocoder, "top-left");

      // map.addControl(
      //   new mapboxgl.GeolocateControl({
      //     showUserLocation: false
      //   })
      // );

      //! adding the marker to the map
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.style.backgroundImage = `url(${airportIconUrl})`;
      markerElement.style.width = "8px";
      markerElement.style.height = "8px";

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(currentLocation)
        .addTo(map);

      markerRef.current = marker;

      //! updating the marker position and size according to the zoom level
      map.on("zoom", () => {
        const currentZoom = map.getZoom();
        const newSize = 5 * currentZoom;

        markerElement.style.width = `${newSize}px`;
        markerElement.style.height = `${newSize}px`;
      });

      // window.addEventListener('deviceorientation', (event) => {
      //   const rotation = event.alpha || 0;
      //   const serverTrack = serverTrackRef.current ;
      //   setRotationAngle(rotation);
      //   marker.setRotation(-serverTrack);
      // });

      //! updating the marker position and rotation according to the GPS data
    } else {
      if (isUpdatingCamera) {
        markerRef.current.setLngLat(currentLocation);
        markerRef.current.setRotation(0);
        // console.log('handleStartButtonClick rotation:', rotationAngle);
      } else {
        window.addEventListener("deviceorientation", (event) => {
          const serverTrack = serverTrackRef.current || 0;
          setRotationAngle(serverTrack);
          markerRef.current.setRotation(-serverTrack);
        });

        const totalRotation = rotationAngle - mapRotation;
        markerRef.current.setLngLat(currentLocation);
        markerRef.current.setRotation(totalRotation);
        // console.log('rotationAngle:', rotationAngle);
      }

      //! totalRotation is the difference between the map rotation and the marker rotation
      const totalRotation = rotationAngle - mapRotation;
      markerRef.current.setLngLat(currentLocation);
      markerRef.current.setRotation(totalRotation);
    }
    return () => {
      clearInterval(markerIntervalId);
    };
  }, [currentLocation, rotationAngle, isUpdatingCamera, mapRotation]);

  //! updating the map rotation according to the map rotation
  useEffect(() => {
    const map = mapRef.current;

    const handleMapRotate = () => {
      const newMapRotation = map.getBearing();
      setMapRotation(newMapRotation);
      // console.log('Map Rotation:', newMapRotation);
    };

    map.on("rotate", handleMapRotate);

    return () => {
      map.off("rotate", handleMapRotate);
    };
  }, []);

  //! When user reaches the destination this useEffect will be called
  useEffect(() => {
    if (remainingTime && remainingTime <= 10) {
      setIsLocationReached(true);
      whenReachingDestination(
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
      );
    }

    //! the visibilty time of the banner
    const timeoutId = setTimeout(() => {
      setIsLocationReached(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [remainingTime]);

  return (
    <div>
      <div
        className="text-paragraph"
        style={{ visibility: isLabelVisible ? "hidden" : "visible" }}
      >
        <p>
          {routeSteps.map((step, index) => (
            <span
              key={index}
              style={{ display: index === currentStepIndex ? "block" : "none" }}
            >
              {` ${step.maneuver.instruction}\n`}
            </span>
          ))}
        </p>
        <p>
          {routeSteps.map((step, index) => (
            <span
              key={index}
              style={{ display: index === currentStepIndex ? "block" : "none" }}
            >
              {`Distance to next turn: ${Math.round(step.distance)} meters\n`}
            </span>
          ))}
        </p>
        <p>
          Expected Arrival Time:{" "}
          {remainingTime ? formatExpectedArrival(remainingTime) : "Calculating"}
        </p>
        <p>
          {remainingTime
            ? routeSteps.map((step, index) => (
                <span
                  key={index}
                  style={{
                    display: index === currentStepIndex ? "block" : "none",
                  }}
                >
                  {/* Content for this span */}
                </span>
              ))
            : "Calculating"}
        </p>
      </div>

      <div
        className="text-paragraph-time"
        style={{ visibility: isLabelVisible ? "hidden" : "visible" }}
      >
        <p>
          Remaining Time:{" "}
          {remainingTime ? formatRemainingTime(remainingTime) : "Calculating"}
        </p>
        <p>
          {routeSteps.map((step, index) => (
            <span
              key={index}
              style={{ display: index === currentStepIndex ? "block" : "none" }}
            >
              {`Time to next turn: ${Math.round(step.duration / 60).toFixed(
                0
              )} min\n`}
            </span>
          ))}
        </p>
        {isLocationReached && <p>You have reached the location!</p>}
      </div>

      <div
        className="text-paragraph-time"
        style={{ visibility: isLabelVisible ? "hidden" : "visible" }}
      >
        <p>
          Remaining Time:{" "}
          {remainingTime ? formatRemainingTime(remainingTime) : "Calculating"}
        </p>
        <p>
          {routeSteps.map((step, index) => (
            <span
              key={index}
              style={{ display: index === currentStepIndex ? "block" : "none" }}
            >
              {`Time to next turn: ${Math.round(step.duration / 60).toFixed(
                0
              )} min\n`}
            </span>
          ))}
        </p>
        {isLocationReached && <p>You have reached the location!</p>}
      </div>

      <div className="sidebarStyle">
        <div
          onClick={() =>
            handleStartButtonClick(
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
            )
          }
          style={{
            backgroundImage: `url(${navigation})`,
            zIndex: "1",
            visibility: isButtonVisible ? "hidden" : "visible",

            position: "fixed",
            bottom: "10px",
            right: "10px",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            borderRadius: "5px",
            backgroundColor: "white",
            backgroundSize: "cover",
            border: "5px solid white",
          }}
        />
      </div>

      <div className="sidebarStyle">
        <div
          onClick={() => toCurrentLocation(mapRef, serverCoordinatesRef)}
          style={{
            backgroundImage: `url(${currentLocationMarker})`,
            zIndex: "1",
            visibility: isButtonVisible ? "visible" : "visible",

            position: "fixed",
            top: "105px",
            right: "9px",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            borderRadius: "5px",
            backgroundColor: "white",
            backgroundSize: "cover",
            border: "5px solid white",
          }}
        />
      </div>

      <div className="sidebarStyle-renavigate">
        <div
          onClick={() =>
            handleReNavigating(
              mapRef,
              markerRef,
              serverCoordinatesRef,
              serverTrackRef,
              setIsUpdatingCamera,
              mapContainerRef,
              setRenavigatingButtonVisible,
              updateInterval
            )
          }
          style={{
            backgroundImage: `url(${navigation})`,
            zIndex: "1",
            visibility: isRenavigatingButtonVisible ? "hidden" : "visible",

            position: "fixed",
            bottom: "10px",
            right: "10px",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            borderRadius: "5px",
            backgroundColor: "white",
            backgroundSize: "cover",
            border: "5px solid white",
          }}
        />
      </div>

      <div className="sidebarStyle-exit">
        <div
          onClick={() =>
            handleExitButtonClick(
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
            )
          }
          style={{
            backgroundImage: `url(${stop_navigation})`,
            zIndex: "1",
            visibility: isExitButtonVisible ? "hidden" : "visible",

            position: "fixed",
            bottom: "50px",
            right: "10px",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            borderRadius: "5px",
            backgroundColor: "white",
            backgroundSize: "cover",
            border: "5px solid white",
          }}
        />
      </div>

      <div className="map-container" ref={mapContainerRef} />
    </div>
  );
};

export default Map;
