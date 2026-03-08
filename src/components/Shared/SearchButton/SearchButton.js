import React from "react";
import "./SearchButton.css";

const SearchButton = ({
  onClick,
  variant = "default", // "default", "notification"
  className = "",
  style = {},
  children = <i className="fas fa-search"></i>,
}) => {
  // Define color schemes for different variants
  const variants = {
    default: {
      backgroundColor: "#f8fafc",
      color: "#1a237e",
      hoverColor: "#f1f5f9",
    },
  };

  const currentVariant = variants[variant] || variants.default;

  const baseStyle = {
    padding: "0 14px",
    height: "38px",
    borderRadius: "0 20px 20px 0",
    border: "1.5px solid #e0e7ef",
    borderLeft: "none",
    backgroundColor: currentVariant.backgroundColor,
    cursor: "pointer",
    fontSize: 16,
    color: currentVariant.color,
    transition: "background-color 0.18s",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    ...style,
  };

  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = currentVariant.hoverColor;
  };

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = currentVariant.backgroundColor;
  };

  return (
    <button
      onClick={onClick}
      className={`shared-search-button ${className}`}
      style={baseStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
    </button>
  );
};

export default SearchButton;
