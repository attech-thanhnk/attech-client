import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const FormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  title, 
  submitText, 
  cancelText, 
  loading, 
  children,
  width = 800,
  size = "lg",
  showActions = true
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      // document.body.style.overflow = 'hidden'; // Loại bỏ dòng này
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // document.body.style.overflow = 'unset'; // Loại bỏ dòng này
    };
  }, [show, onClose]);

  if (!show) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Dynamic sizing based on size prop
  const getModalSize = () => {
    if (size === "xl") return { width: '90vw', maxWidth: '1400px', height: '90vh' };
    if (size === "lg") return { width: '75vw', maxWidth: '1200px', height: '85vh' };
    if (size === "md") return { width: '60vw', maxWidth: '900px', height: '80vh' };
    return { width: width || '50vw', maxWidth: '800px', height: '75vh' };
  };

  const modalSize = getModalSize();

  const modalContent = (
    <div className="modal show" onClick={handleOverlayClick}>
      <div className="modal-content" style={{ 
        width: modalSize.width,
        maxWidth: modalSize.maxWidth, 
        minWidth: '600px',
        height: modalSize.height,
        maxHeight: '95vh',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="modal-header">
          <h5>{title}</h5>
          <button 
            type="button"
            className="modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="modal-body" style={{
          flex: '1',
          overflowY: 'auto',
          padding: '20px'
        }}>
          {showActions ? (
            <form onSubmit={handleSubmit} style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ flex: '1', overflowY: 'auto' }}>
                {children}
              </div>
              <div className="form-actions" style={{
                flexShrink: '0',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText || "Hủy"}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : (submitText || "Lưu")}
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FormModal; 