import React, { useState } from "react";

//! This takes a callback function as a prop. The callback function will be called when the user clicks the Search button. The callback function will be passed the data returned from the Mapbox API. The SearchBox component will be used in the Map component.
const SearchBox = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const mapboxAccessToken =
      "pk.eyJ1IjoidmVnYWlubm92YXRpb25zIiwiYSI6ImNsbTV3c3hwZDA4ZDgzcGxna2IxbDZtNXMifQ.eVpetpE1_nHx3K-LRMPb0g";
    const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxAccessToken}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (onSearch) {
          onSearch(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    setSearchQuery("");
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
