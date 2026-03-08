import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../hooks/useI18n';
import { getLocalizedRoute, buildNewsDetailUrl, buildProductDetailUrl, buildServiceDetailUrl } from '../../../utils/routeHelpers';

const LocalizedLink = ({ 
  to, 
  routeKey, 
  params = {}, 
  newsItem,
  product, 
  service,
  category,
  children, 
  className,
  style,
  ...props 
}) => {
  const { currentLanguage } = useI18n();
  
  let href = to;
  
  // If routeKey is provided, generate localized route
  if (routeKey) {
    href = getLocalizedRoute(routeKey, params, currentLanguage);
  }
  // If newsItem is provided, generate news detail URL
  else if (newsItem && category) {
    href = buildNewsDetailUrl(newsItem, category, currentLanguage);
  }
  // If product is provided, generate product detail URL
  else if (product && category) {
    href = buildProductDetailUrl(product, category, currentLanguage);
  }
  // If service is provided, generate service detail URL
  else if (service) {
    href = buildServiceDetailUrl(service, currentLanguage);
  }
  
  return (
    <Link 
      to={href} 
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LocalizedLink;