import React, { useState } from 'react';

const SearchBox = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // Replace this with the actual Mapbox Geocoding API request
    // You need to use your Mapbox access token
    const mapboxAccessToken = 'pk.eyJ1IjoidmVnYWlubm92YXRpb25zIiwiYSI6ImNsbTV3c3hwZDA4ZDgzcGxna2IxbDZtNXMifQ.eVpetpE1_nHx3K-LRMPb0g';
    const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxAccessToken}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Handle the Mapbox Geocoding API response data here
        if (onSearch) {
          onSearch(data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // Optionally, you can clear the search input
    setSearchQuery('');
  };

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBox;
