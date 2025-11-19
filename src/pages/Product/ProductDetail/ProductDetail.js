import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../ProductDetail/ProductDetail.css";
import * as clientProductService from "../../../services/clientProductService";
import { useI18n } from "../../../hooks/useI18n";
import ErrorPage from "../../../components/Shared/ErrorPage";
import LocalizedLink from "../../../components/Shared/LocalizedLink";
import SEO from "../../../components/SEO/SEO";
import sanitizeHtml from "sanitize-html";
import { getApiBaseUrl } from "../../../config/apiConfig";

const ProductDetail = () => {
  const { slug: productSlug } = useParams();
  const { t, currentLanguage } = useI18n();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await clientProductService.getProductBySlug(productSlug);
        
        if (productData) {
          const formattedProduct = clientProductService.formatProductForDisplay(productData, currentLanguage);
          setProduct({ ...productData, ...formattedProduct });
        } else {
          setError("Product not found");
        }
      } catch (err) {setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      loadProduct();
    }
  }, [productSlug, currentLanguage]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <ErrorPage
        title="Sản phẩm không tồn tại"
        message="Xin lỗi, sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        suggestions={[
          "Kiểm tra lại đường link",
          "Tìm kiếm sản phẩm khác",
          "Quay lại trang danh sách sản phẩm"
        ]}
        type="product"
        backRoute="HOME"
        backText="Về trang chủ"
        listRoute="PRODUCTS"
        listText="Xem tất cả sản phẩm"
      />
    );
  }

  const getContent = () => {
    return product.displayContent || (currentLanguage === "vi" ? product.contentVi : product.contentEn);
  };

  // Combine main product image with gallery images
  const getAllImages = () => {
    const images = [];

    // Add main product image first if exists
    if (product.imageUrl) {
      images.push({
        id: 'main',
        url: product.imageUrl.startsWith('http') ? product.imageUrl : product.imageUrl,
        originalFileName: product.displayTitle + ' - Ảnh chính',
        fileSize: 0,
        isMainImage: true
      });
    }

    // Add gallery images
    if (product.attachments?.images?.length > 0) {
      images.push(...product.attachments.images.map(img => ({
        ...img,
        isMainImage: false
      })));
    }

    return images;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeDisplay = (contentType) => {
    if (!contentType) return 'Unknown';
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('word')) return 'Word';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'Excel';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'PowerPoint';
    if (contentType.includes('image')) return 'Image';
    if (contentType.includes('text')) return 'Text';
    return contentType.split('/')[1]?.toUpperCase() || 'File';
  };

  return (
    <>
      <SEO
        title={product.displayTitle}
        description={product.displayDescription || product.displayTitle}
        keywords={`${product.displayTitle}, ${product.displayCategoryTitle || 'sản phẩm'}, ATTECH, sản phẩm`}
        image={product.imageUrl?.startsWith('http') ? product.imageUrl : `${getApiBaseUrl()}${product.imageUrl}`}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        locale={currentLanguage === 'en' ? 'en_US' : 'vi_VN'}
        type="product"
      />
      <div className="product-content-wrap">
        {/* Breadcrumb */}
        <nav className="product-breadcrumb">
        <LocalizedLink routeKey="PRODUCTS">
          {t("navigation.products")}
        </LocalizedLink>
        <span className="breadcrumb-sep">/</span>
        <span>{product.displayTitle}</span>
      </nav>

      {/* Card chính */}
      <div className="product-detail-card">
        {/* Header Section */}
        <div className="product-header">
          {/* Combined Image Gallery */}
          {getAllImages().length > 0 && (
            <div className="product-main-gallery">
              <div className="product-gallery">
                {/* Main Image */}
                <div className="main-image-container">
                  <img
                    src={getAllImages()[currentImageIndex].url.startsWith('http')
                      ? getAllImages()[currentImageIndex].url
                      : `${getApiBaseUrl()}${getAllImages()[currentImageIndex].url}`}
                    alt={getAllImages()[currentImageIndex].originalFileName}
                    className="main-image"
                    onClick={() => setSelectedImage(getAllImages()[currentImageIndex])}
                  />
                  {getAllImages().length > 1 && (
                    <div className="image-counter">
                      {currentImageIndex + 1} / {getAllImages().length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {getAllImages().length > 1 && (
                  <div className="thumbnail-container">
                    {getAllImages().map((image, index) => (
                      <div
                        key={image.id}
                        className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={image.url.startsWith('http') ? image.url : `${getApiBaseUrl()}${image.url}`}
                          alt={image.originalFileName}
                          className="thumbnail-image"
                          loading="lazy"
                        />
                        {image.isMainImage && (
                          <div className="main-badge">Chính</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-detail-title">{product.displayTitle}</h1>
            {product.displayDescription && (
              <p className="product-detail-desc">{product.displayDescription}</p>
            )}
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="article-content">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(getContent(), {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                  "img",
                  "figure",
                  "figcaption",
                ]),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: [
                    "src",
                    "alt",
                    "title",
                    "class",
                    "width",
                    "height",
                    "loading",
                  ],
                  figure: ["class"],
                  figcaption: ["class"],
                  div: ["style", "class"],
                  p: ["style", "class"],
                  span: ["style", "class"],
                  a: ["href", "target", "rel"],
                },
                allowedStyles: {
                  "*": {
                    color: [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
                    "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
                    "font-size": [/^\d+(?:px|em|%)$/],
                    "font-weight": [/^(?:normal|bold|bolder|lighter|[1-9]00)$/],
                  },
                },
              }),
            }}
          />
        </div>

        {/* Attachments Section - Documents Only */}
        {product.attachments && product.attachments.documents?.length > 0 && (
          <div className="product-attachments">
            <h3>{currentLanguage === 'vi' ? 'Tài liệu đính kèm' : 'Documents'}</h3>

            {/* Documents List */}
            {product.attachments.documents?.length > 0 && (
              <div className="attachment-section">
                <h4>{currentLanguage === 'vi' ? 'Tài liệu' : 'Documents'}</h4>
                <div className="documents-list">
                  {product.attachments.documents.map((doc, index) => (
                    <div key={doc.id} className="document-item">
                      <div className="doc-icon">
                        <i className={`fas ${doc.contentType.includes('pdf') ? 'fa-file-pdf' : 'fa-file'}`}></i>
                      </div>
                      <div className="doc-info">
                        <a
                          href={`${getApiBaseUrl()}${doc.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="doc-name"
                        >
                          {doc.originalFileName}
                        </a>
                        <div className="doc-meta">
                          <span className="doc-type">{getFileTypeDisplay(doc.contentType)}</span>
                          <span className="doc-size">{formatFileSize(doc.fileSize)}</span>
                        </div>
                      </div>
                      <a
                        href={`${getApiBaseUrl()}${doc.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-btn"
                        aria-label={`Download ${doc.originalFileName}`}
                      >
                        <i className="fas fa-download"></i>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Nút quay lại */}
        <div className="product-detail-backwrap">
          <LocalizedLink routeKey="PRODUCTS" className="product-detail-backbtn">
            <i className="fas fa-arrow-left"></i>{" "}
            {currentLanguage === "vi"
              ? "Quay lại danh sách sản phẩm"
              : "Back to products"}
          </LocalizedLink>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="image-modal"
          onClick={() => setSelectedImage(null)}
        >
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              <i className="fas fa-times"></i>
            </button>
            <img
              src={`${getApiBaseUrl()}${selectedImage.url}`}
              alt={selectedImage.originalFileName}
              className="image-modal-img"
            />
            <div className="image-modal-info">
              <h4>{selectedImage.originalFileName}</h4>
              <p>{formatFileSize(selectedImage.fileSize)}</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ProductDetail;
