import React, { useRef, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../../config/apiConfig';

const ImageUploadPreview = ({ 
  value, 
  onChange, 
  label = 'Ảnh', 
  disabled = false, 
  error,
  onFileSelected // Callback khi chọn file để parent có thể lưu file object
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef();
  
  // Initialize preview from existing value
  useEffect(() => {
    if (value && !selectedFile) {
      // Nếu có value từ props và chưa chọn file mới
      setPreviewUrl(getImageUrl(value));
    }
  }, [value]);
  
  // Helper function để xử lý image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Nếu đã là absolute URL hoặc blob URL, giữ nguyên
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Nếu là relative path, thêm base URL
    const API_BASE_URL = getApiBaseUrl();
    return `${API_BASE_URL}${imagePath}`;
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    
    //  Clean up previous blob URL trước khi tạo mới
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Tạo preview URL ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    
    // Gọi callback để parent component lưu file object
    if (onFileSelected) {
      onFileSelected(file);
    }
    
    // Update value trong parent - CHỈ pass file name, KHÔNG pass blob URL
    if (onChange) {
      onChange(`blob_${file.name}`); //  Safe identifier thay vì blob URL
    }
  };
  
  const handleRemoveImage = () => {
    // Clean up object URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
    setSelectedFile(null);
    
    if (onFileSelected) {
      onFileSelected(null);
    }
    
    if (onChange) {
      onChange('');
    }
    
    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  // Clear input value để có thể chọn lại file cùng tên
  const handleInputClick = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  // Cleanup khi component unmount - CHỈ cleanup khi component thực sự unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []); //  Empty dependency để chỉ chạy khi unmount
  
  return (
    <div className="image-upload-preview-component">
      {label && <label>{label}</label>}
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: '1' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            onClick={handleInputClick}
            disabled={disabled}
            ref={inputRef}
            className={`form-control ${error ? 'is-invalid' : ''}`}
          />
          {error && <div className="invalid-feedback">{error}</div>}
          
          {selectedFile && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <small style={{ color: '#666' }}>
                <i className="bi bi-file-image"></i> {selectedFile.name} 
                ({Math.round(selectedFile.size / 1024)}KB)
                <span style={{ color: '#28a745', marginLeft: '8px' }}>
                  <i className="bi bi-check-circle"></i> Sẵn sàng upload
                </span>
              </small>
            </div>
          )}
        </div>
        
        {previewUrl && (
          <div style={{ position: 'relative' }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '80px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              onError={(e) => {e.target.style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Xóa ảnh"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadPreview;