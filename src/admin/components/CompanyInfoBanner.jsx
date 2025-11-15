import React, { useState, useEffect } from 'react';
import {
  getAllBannerSettings,
  uploadBannerSetting,
  deleteBannerSetting,
  getBannerKeys
} from '../../services/bannerService';
import BannerUploadItem from './BannerUploadItem';
import ToastMessage from './ToastMessage';
import LoadingSpinner from './LoadingSpinner';
import './BannerManager.css';

const CompanyInfoBanner = () => {
  const [banners, setBanners] = useState({});
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Chỉ lấy các banner có category='companyinfo'
  const companyInfoBannerKeys = getBannerKeys().filter(banner => banner.category === 'companyinfo');

  // Fetch all banner settings on component mount
  const fetchAllBanners = async () => {
    try {
      setLoading(true);
      const data = await getAllBannerSettings();
      setBanners(data);
    } catch (error) {
      setToast({
        show: true,
        message: 'Không thể tải danh sách ảnh thông tin công ty!',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBanners();
  }, []);

  // Upload banner for specific key
  const handleUploadBanner = async (bannerKey, file) => {
    setUploading(prev => ({ ...prev, [bannerKey]: true }));

    try {
      // Validate file
      if (!file) {
        throw new Error('Vui lòng chọn file để upload');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ chấp nhận file hình ảnh');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Kích thước file không được vượt quá 5MB');
      }

      const result = await uploadBannerSetting(bannerKey, file);

      // Update banners state with new data
      setBanners(prev => ({
        ...prev,
        [bannerKey.charAt(0).toUpperCase() + bannerKey.slice(1)]: {
          url: result.url,
          uploadDate: result.uploadDate,
          fileName: result.fileName,
          fileSize: result.fileSize,
          id: result.id
        }
      }));

      setToast({
        show: true,
        message: `Upload ${bannerKey} thành công!`,
        type: 'success'
      });

      // Refresh all banners to ensure consistency
      await fetchAllBanners();

    } catch (error) {
      setToast({
        show: true,
        message: error.message || `Upload ${bannerKey} thất bại!`,
        type: 'error'
      });
    } finally {
      setUploading(prev => ({ ...prev, [bannerKey]: false }));
    }
  };

  // Delete banner
  const handleDeleteBanner = async (bannerKey) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${bannerKey}?`)) {
      return;
    }

    try {
      await deleteBannerSetting(bannerKey);

      // Update state to remove deleted banner
      setBanners(prev => {
        const newBanners = { ...prev };
        delete newBanners[bannerKey.charAt(0).toUpperCase() + bannerKey.slice(1)];
        return newBanners;
      });

      setToast({
        show: true,
        message: `Xóa ${bannerKey} thành công!`,
        type: 'success'
      });

      // Refresh all banners
      await fetchAllBanners();

    } catch (error) {
      setToast({
        show: true,
        message: error.message || `Xóa ${bannerKey} thất bại!`,
        type: 'error'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="banner-manager">
      <div className="banner-sections">
        {/* Structure Chart Section */}
        <div className="banner-section">
          <h3 className="section-title">
            <i className="bi bi-diagram-3"></i>
            Sơ đồ cơ cấu tổ chức
          </h3>
          <div className="banner-grid">
            {companyInfoBannerKeys
              .filter(b => b.key === 'StructureChart')
              .map(bannerConfig => {
                const banner = banners[bannerConfig.key];
                return (
                  <BannerUploadItem
                    key={bannerConfig.key}
                    bannerKey={bannerConfig.key}
                    title={bannerConfig.label}
                    description={bannerConfig.description}
                    currentUrl={banner?.url}
                    uploadedAt={banner?.uploadDate}
                    onUpload={handleUploadBanner}
                    onDelete={handleDeleteBanner}
                    uploading={uploading[bannerConfig.key]}
                  />
                );
              })}
          </div>
        </div>

        {/* Leadership Section */}
        <div className="banner-section">
          <h3 className="section-title">
            <i className="bi bi-people"></i>
            Ban lãnh đạo
          </h3>
          <div className="banner-grid">
            {companyInfoBannerKeys
              .filter(b => b.key.startsWith('Leader'))
              .map(bannerConfig => {
                const banner = banners[bannerConfig.key];
                return (
                  <BannerUploadItem
                    key={bannerConfig.key}
                    bannerKey={bannerConfig.key}
                    title={bannerConfig.label}
                    description={bannerConfig.description}
                    currentUrl={banner?.url}
                    uploadedAt={banner?.uploadDate}
                    onUpload={handleUploadBanner}
                    onDelete={handleDeleteBanner}
                    uploading={uploading[bannerConfig.key]}
                  />
                );
              })}
          </div>
        </div>
      </div>

      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default CompanyInfoBanner;
