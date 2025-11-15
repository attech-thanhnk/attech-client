import React, { useCallback, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { searchNews, formatNewsForDisplay } from "../../../services/clientNewsService";
import { useI18n } from "../../../hooks/useI18n";
import SearchButton from "../SearchButton";
import "./SearchBox.css";

const SearchBox = ({ 
  value, 
  onChange, 
  placeholder, 
  onSearch,
  onSelectSuggestion,
  className = "",
  style = {}
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim().length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }
  }, []);

  const handleSearch = useCallback(() => {
    if (onSearch && inputValue.trim()) {
      onChange(inputValue);
      onSearch(inputValue);
      setShowDropdown(false);
    }
  }, [inputValue, onSearch, onChange]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }, [handleSearch]);

  const handleSuggestionClick = useCallback((suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    setShowDropdown(false);
  }, [onSelectSuggestion]);

  // Fetch suggestions when input value changes
  useEffect(() => {
    if (inputValue.trim().length >= 2 && showDropdown) {
      const fetchSuggestions = async () => {
        try {
          setLoading(true);
          const response = await searchNews(inputValue, {
            pageIndex: 1,
            pageSize: 5
          });
          
          const formattedSuggestions = response.items.map(item => 
            formatNewsForDisplay(item, currentLanguage)
          );
          setSuggestions(formattedSuggestions);
        } catch (error) {setSuggestions([]);
        } finally {
          setLoading(false);
        }
      };

      const timer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timer);
    }
  }, [inputValue, currentLanguage, showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultStyle = {
    padding: "8px 14px",
    borderRadius: 20,
    border: "1.5px solid #e0e7ef",
    fontSize: 15,
    minWidth: 220,
    outline: "none",
    boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
    transition: "border 0.18s",
    color: "#1a237e",
    ...style
  };

  return (
    <div className="search-box-container">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          key="search-input"
          type="text"
          placeholder={placeholder || t("frontend.news.searchPlaceholder")}
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className={`search-box ${className}`}
          style={{
            ...defaultStyle, 
            borderRadius: "20px 0 0 20px", 
            borderRight: "none",
            flex: 1,
            minWidth: 0
          }}
        />
        <SearchButton 
          onClick={handleSearch}
          variant="default"
          className="search-box-button"
        />
      </div>
      
      {showDropdown && (
        <div ref={dropdownRef} className="search-dropdown">
          {loading ? (
            <div className="search-dropdown-item loading">
              Đang tìm kiếm...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                className="search-dropdown-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-title">{suggestion.title}</div>
                <div className="suggestion-date">{suggestion.formattedDate}</div>
              </div>
            ))
          ) : (
            <div className="search-dropdown-item no-results">
              Không tìm thấy kết quả
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;