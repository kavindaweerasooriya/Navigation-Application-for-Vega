import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import airportIconUrl from '../Components/car_Icon.png'; 
import navigation from '../Components/gps.png';
import stop_navigation from '../Components/stop_navigation.png';
import './Map.css';


mapboxgl.accessToken =
  'pk.eyJ1IjoidmVnYWlubm92YXRpb25zIiwiYSI6ImNsbTV3c3hwZDA4ZDgzcGxna2IxbDZtNXMifQ.eVpetpE1_nHx3K-LRMPb0g';

const Map = () => {
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const serverCoordinatesRef = useRef(null);
  const serverTrackRef = useRef(null);
  const coordinatesRef = useRef(null);
  const speedRef = useRef(null);
  const directionsLayerId = 'directions';
  const mapRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState([80.7718, 7.8731]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [mapRotation, setMapRotation] = useState(0);
  const [locationMonitoringIntervalRef, setLocationMonitoringIntervalRef] = useState(null); 
  const [routeSteps, setRouteSteps] = useState([]);
 
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isExitButtonVisible, setExitsButtonVisible] = useState(true);
  const [isLabelVisible, setIsLabelVisible] = useState(true);
  const [isUpdatingCamera, setIsUpdatingCamera] = useState(false);
  const [isRenavigatingButtonVisible, setRenavigatingButtonVisible] = useState(true);

  let markerIntervalId; 

  useEffect(() => {
    const updateMap = async () => {
      try {
        const response = await fetch('http://localhost:3001/data');
        const data = await response.json();

        if (data && data.data && data.data.latitude && data.data.longitude) {
          setCurrentLocation([data.data.longitude, data.data.latitude]);
          serverCoordinatesRef.current = [data.data.longitude, data.data.latitude];
          const track = data.data.track || 0;
          serverTrackRef.current = track;
          setRotationAngle(track);
          const speed = data.data.speed;
          speedRef.current = data.data.speed;

          console.log('GPS data:', data.data);
          console.log('speed:', speed);
          console.log('track:', track);
        }
      } catch (error) {
        console.error('Error fetching GPS data:', error);
      }
    };

    const gpsDataIntervalId = setInterval(updateMap, 100);

    return () => {
      clearInterval(gpsDataIntervalId);
    };
  }, []);

  useEffect(() => {
    let marker = markerRef.current;

if (!markerRef.current) {

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // style: 'mapbox://styles/vegainnovations/cln9zh9ld03h701pb7jxcdbr1',
      style: 'mapbox://styles/mapbox/outdoors-v12', 

      zoom: 2,
      center: currentLocation,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;
    
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      countries: 'LK',
    });

    geocoder.on('result', (event) => {
      const { geometry } = event.result;
      const coordinates = geometry.coordinates;
      coordinatesRef.current = coordinates;
      setIsButtonVisible(false);
      setExitsButtonVisible(true);
      setIsLabelVisible(true);
      setRenavigatingButtonVisible(true);
    

    });
    

    geocoder.on('clear', () => {
      if (map.getLayer(directionsLayerId)) {
        map.removeLayer(directionsLayerId);
        map.removeSource(directionsLayerId);
        
      }
      setIsButtonVisible(true);
      setExitsButtonVisible(true);
      setIsLabelVisible(true);
      setRenavigatingButtonVisible(true);


      setRouteSteps([]);
      setCurrentStepIndex(0);
      setRemainingTime(null);
      clearInterval(locationMonitoringIntervalRef);
      console.log("locaa");

    });
    
    map.addControl(geocoder, 'top-left');

    map.addControl(
      new mapboxgl.GeolocateControl({
        showUserLocation: false
      })
    );
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.backgroundImage = `url(${airportIconUrl})`;
      markerElement.style.width = '8px';
      markerElement.style.height = '8px';
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(currentLocation)
        .addTo(map);
      
      markerRef.current = marker;
      
      map.on('zoom', () => {
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
  }else{

    if (isUpdatingCamera) {

      markerRef.current.setLngLat(currentLocation);
      markerRef.current.setRotation(0);
      // console.log('handleStartButtonClick rotation:', rotationAngle);
    } else {

      window.addEventListener('deviceorientation', (event) => {
        const serverTrack = serverTrackRef.current || 0;
        setRotationAngle(serverTrack);
        markerRef.current.setRotation(-serverTrack);
      });

      const totalRotation = rotationAngle - mapRotation;
      markerRef.current.setLngLat(currentLocation);
      markerRef.current.setRotation(totalRotation);
      // console.log('rotationAngle:', rotationAngle);
    }

  }
    return () => {
      clearInterval(markerIntervalId);
     
    };
  }, [currentLocation,rotationAngle,isUpdatingCamera,mapRotation]);


  useEffect(() => {
    const map = mapRef.current;
  
    const handleMapRotate = () => {
      const newMapRotation = map.getBearing();
      setMapRotation(newMapRotation);
      // console.log('Map Rotation:', newMapRotation);
    };
  
    map.on('rotate', handleMapRotate);
  
    return () => {
      map.off('rotate', handleMapRotate);
    };
  }, []);
  


  const handleStartButtonClick = () => {
    const map = mapRef.current;
    const marker = markerRef.current;
    let locationMonitoringIntervalRef;
    setIsButtonVisible(true);
    setIsLabelVisible(false);
    setRenavigatingButtonVisible(false);
    



    setExitsButtonVisible(false);
    const updateCamera = () => {
      const currentCoordinates = serverCoordinatesRef.current;
      const currentTrack = serverTrackRef.current;
     

      // // markerRef.current.setRotation(0);
      // mapRef.current.setBearing(currentTrack,{
      //   duration: 1,
      //   easing: (t) => t,
      // }
      //   );
      // mapRef.current.setCenter(currentCoordinates);
      // mapRef.current.setZoom(16);
 
      map.easeTo({
        bearing:currentTrack,
        center: currentCoordinates,
        zoom: 16,
      });
      setIsUpdatingCamera(true);

  
      // console.log("currentCoordinates updating : " + currentCoordinates, "currentTrack:", currentTrack);
    };
 
  
    const updateInterval = setInterval(updateCamera, 1);

    locationMonitoringIntervalRef = setInterval(async () => {
      const updatedLocation = await getCurrentLocation(serverCoordinatesRef.current); 
      await calculateAndDisplayRoute(map, updatedLocation, coordinatesRef.current);
      console.log("Routr")
    }, 2000); 
    setLocationMonitoringIntervalRef(locationMonitoringIntervalRef);
  
    mapContainerRef.current.addEventListener('click', () => {
      console.log('clicked');
      clearInterval(updateInterval);
      setIsUpdatingCamera(false);
      // clearInterval(locationMonitoringIntervalRef);
      // setLocationMonitoringIntervalRef(null);
   

      // setCurrentStepIndex((prevIndex) => Math.min(prevIndex + 1, routeSteps.length - 1));
    });

    return () => {
      clearInterval(locationMonitoringIntervalRef); 
      map.remove();
      
    };
  };

  
  const handleReNavigating = () => {

    const map = mapRef.current;
    const marker = markerRef.current;
    let locationMonitoringIntervalRef;
    setRenavigatingButtonVisible(false);

    const updateCamera = () => {
      const currentCoordinates = serverCoordinatesRef.current;
      const currentTrack = serverTrackRef.current;

 
      map.easeTo({
        bearing:currentTrack,
        center: currentCoordinates,
        zoom: 16,
      });
      setIsUpdatingCamera(true);

      };

      mapContainerRef.current.addEventListener('click', () => {
        console.log('clicked');
        clearInterval(updateInterval);
        setIsUpdatingCamera(false);

      });
 
  
    const updateInterval = setInterval(updateCamera, 1);
    };



  const handleExitButtonClick = () => {
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




    setRouteSteps([]);
    setCurrentStepIndex(0);
    setRemainingTime(null);
    clearInterval(locationMonitoringIntervalRef);
    console.log("locaa");

  };

  const getCurrentLocation =  async (origin1) => {
    return new Promise((resolve) => {
      const updatedLocation = [origin1[0], origin1[1]];
      resolve(updatedLocation);
    });
  };
  
  
  const calculateAndDisplayRoute = async (map, origin, destination) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
  
      if (data.routes && data.routes.length > 0) {
        const routeGeometry = data.routes[0].geometry;
        const newRouteSteps = data.routes[0].legs.reduce((acc, leg) => acc.concat(leg.steps), []);
        const newRemainingTime = data.routes[0].duration;
        const newRemainingDistance = data.routes[0].distance;

        console.log("newRouteSteps",newRouteSteps);
  
        setRouteSteps(newRouteSteps);
        setRemainingTime(newRemainingTime);
        const originalModifier = data.routes[0].legs[0].steps[0].maneuver.modifier;
        console.log("originalModifier", originalModifier);

        const currentModifier = data.routes[0].modifier ;
        console.log("currentModifier",currentModifier);
  
        const directionsLayerId = 'directions';
  
        if (!map.getLayer(directionsLayerId) && !map.getSource(directionsLayerId)) {
          // Layer and source don't exist, add them
          map.addSource(directionsLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeometry,
            },
          });
  
          map.addLayer({
            id: directionsLayerId,
            type: 'line',
            source: directionsLayerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75,
            },
          });
        } else {
          map.getSource(directionsLayerId).setData({
            type: 'Feature',
            properties: {},
            geometry: routeGeometry,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
    }
  };
  
  return (
    <div>
      <div className="text-paragraph" style={{ visibility: isLabelVisible ? 'hidden' : 'visible'  }}>
      <p>
  {routeSteps.map((step, index) => (
    <span key={index} style={{ display: index === currentStepIndex ? 'block' : 'none' }}>
      {` ${step.maneuver.instruction}\n`}
    </span>
  ))}
</p>
<p>
  {routeSteps.map((step, index) => (
    <span key={index} style={{ display: index === currentStepIndex ? 'block' : 'none' }}>
      {`Distance to next turn: ${Math.round(step.distance)} meters\n`}
    </span>
  ))}
</p>
<p>
  {remainingTime ? (
    routeSteps.map((step, index) => (
      <span key={index} style={{ display: index === currentStepIndex ? 'block' : 'none' }}>
        {``}
      </span>
    ))
  ) : (
    'Calculating'
  )}
</p>


      </div>


      <div className="text-paragraph-time" style={{ visibility: isLabelVisible ? 'hidden' : 'visible'  }}>
  <p>Remaining Time: {remainingTime ? `${Math.round(remainingTime)} seconds` : 'Calculating'}</p>
  <p>
    {routeSteps.map((step, index) => (
      <span key={index} style={{ display: index === currentStepIndex ? 'block' : 'none' }}>
        {`Time to next turn: ${Math.round(step.duration)} secs\n`}
      </span>
    ))}
  </p>
</div>

     

      <div className="sidebarStyle">
          <div
            onClick={handleStartButtonClick}
            style={{
              backgroundImage: `url(${navigation})`, 
              zIndex: '1',
              visibility: isButtonVisible ? 'hidden' : 'visible',

              position: 'fixed',
              bottom: '10px',  
              right: '10px', 
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              borderRadius: '5px',
              backgroundColor: 'white',
              backgroundSize: 'cover',
              border: '5px solid white',
              
            }}
          />
        </div>


        <div className="sidebarStyle-renavigate">
          <div
            onClick={handleReNavigating}
            style={{
              backgroundImage: `url(${navigation})`, 
              zIndex: '1',
              visibility: isRenavigatingButtonVisible ? 'hidden' : 'visible',

              position: 'fixed',
              bottom: '10px',  
              right: '10px', 
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              borderRadius: '5px',
              backgroundColor: 'white',
              backgroundSize: 'cover',
              border: '5px solid white',
              
            }}
          />
        </div>


      <div className="sidebarStyle-exit">


        <div
    onClick={handleExitButtonClick}
    style={{
      backgroundImage: `url(${stop_navigation})`, 
      zIndex: '1',
      visibility: isExitButtonVisible ? 'hidden' : 'visible',

      position: 'fixed',
      bottom: '50px',  
      right: '10px', 
      width: '30px',
      height: '30px',
      cursor: 'pointer',
      borderRadius: '5px',
      backgroundColor: 'white',
      backgroundSize: 'cover',
      border: '5px solid white',
      
    }}
  />


      </div>

      

      
      <div className="map-container" ref={mapContainerRef} />
    </div>
  );
};

export default Map;

 // setCurrentStepIndex((prevIndex) => Math.min(prevIndex + 1, routeSteps.length - 1));