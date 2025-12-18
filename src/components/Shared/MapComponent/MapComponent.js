import React from "react";
import "./MapComponent.css";

const MapComponent = ({ lat, lng, zoom = 15, height = "180px", embedUrl }) => {
  // Ưu tiên dùng embedUrl nếu có, không thì tự tạo từ lat/lng
  const mapSrc = embedUrl || `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <div className="map-container" style={{ height, width: "100%" }}>
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: "4px" }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="ATTECH Location Map"
      ></iframe>
    </div>
  );
};

export default MapComponent;
