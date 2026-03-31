import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const RouteWrapper = ({ children }) => {
  const location = useLocation();
  const params = useParams();
  const prevParams = useRef();

  useEffect(() => {
    // Instant scroll để tránh hiển thị khoảng trắng khi chuyển trang
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;

    // Store current params for next comparison
    prevParams.current = params;
  }, [location.pathname, params.slug, params.category]);

  // Create unique key from pathname and critical params
  const routeKey = `${location.pathname}-${params.slug || ''}-${params.category || ''}`;

  // Force re-mount when route changes by using unique key
  return (
    <div key={routeKey}>
      {children}
    </div>
  );
};

export default RouteWrapper;