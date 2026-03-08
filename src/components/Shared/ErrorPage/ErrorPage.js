import React from "react";
import { useI18n } from "../../../hooks/useI18n";
import LocalizedLink from "../LocalizedLink";
import "./ErrorPage.css";

const ErrorPage = ({ 
  title = "Nội dung không tồn tại",
  message = "Nội dung bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
  suggestions = [
    "Kiểm tra lại đường link",
    "Tìm kiếm nội dung khác", 
    "Quay lại trang danh sách"
  ],
  backRoute = "HOME",
  backText = "Về trang chủ",
  listRoute = null,
  listText = null,
  type = "general" // news, notification, product, service, general
}) => {
  const { currentLanguage } = useI18n();

  // Get icon based on type
  const getIcon = () => {
    switch(type) {
      case 'news': return 'fas fa-newspaper';
      case 'notification': return 'fas fa-bell';
      case 'product': return 'fas fa-box';
      case 'service': return 'fas fa-cogs';
      default: return 'fas fa-exclamation-triangle';
    }
  };

  // Get default routes based on type
  const getDefaultListRoute = () => {
    switch(type) {
      case 'news': return 'NEWS';
      case 'notification': return 'NOTIFICATIONS';
      case 'product': return 'PRODUCTS';
      case 'service': return 'SERVICES';
      default: return 'HOME';
    }
  };

  const getDefaultListText = () => {
    switch(type) {
      case 'news': return 'Xem tất cả tin tức';
      case 'notification': return 'Xem tất cả thông báo';
      case 'product': return 'Xem tất cả sản phẩm';
      case 'service': return 'Xem tất cả dịch vụ';
      default: return 'Xem trang chủ';
    }
  };

  return (
    <div className="shared-error-page">
      <div className="container">
        <div className="error-container">
          <div className="error-icon">
            <i className={getIcon()}></i>
          </div>
          <div className="error-content">
            <h1 className="error-title">{title}</h1>
            <p className="error-message">{message}</p>
            
            {suggestions && suggestions.length > 0 && (
              <div className="error-suggestions">
                <h3>Bạn có thể:</h3>
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="error-actions">
              {(listRoute || type !== 'general') && (
                <LocalizedLink 
                  routeKey={listRoute || getDefaultListRoute()} 
                  className="btn-primary"
                >
                  <i className="fas fa-list"></i>
                  {listText || getDefaultListText()}
                </LocalizedLink>
              )}
              
              <LocalizedLink routeKey={backRoute} className="btn-secondary">
                <i className="fas fa-home"></i>
                {backText}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;