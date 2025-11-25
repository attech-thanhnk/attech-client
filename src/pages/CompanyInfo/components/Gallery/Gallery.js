import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import clientAlbumService from "../../../../services/clientAlbumService";
import "./Gallery.css";
import { useI18n } from '../../../../hooks/useI18n';
import SEO from "../../../../components/SEO/SEO";

const Gallery = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { currentLanguage } = useI18n();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setLoading(true);
        // Use clientAlbumService for album data with pagination
        const albumsResponse = await clientAlbumService.getAlbums({
          page: 1,
          limit: itemsPerPage
        });

        if (albumsResponse.success && albumsResponse.data.length > 0) {
          const formattedAlbums = albumsResponse.data.map(album => {
            const formattedItem = clientAlbumService.formatAlbumForDisplay(album, currentLanguage);

            // Album image processing

            return {
              id: album.id,
              slug: formattedItem.slug,
              title: formattedItem.title,
              description: formattedItem.description,
              date: formattedItem.createdAt,
              coverImage: formattedItem.featuredImage || clientAlbumService.getImageUrl(album.imageUrl) || 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image',
            };
          });

          setAlbums(formattedAlbums);
          setTotalItems(albumsResponse.total || 0);
          setHasMore(formattedAlbums.length < (albumsResponse.total || 0));
          setCurrentPage(1);
        } else {
          setAlbums([]);
          setTotalItems(0);
          setHasMore(false);
        }
      } catch (error) {
        setAlbums([]);
        setTotalItems(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLanguage]);

  useEffect(() => {
    if (state?.fromGalleryDetail || state?.fromError) {
      window.scrollTo(0, 0);
    }
  }, [state]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const albumsResponse = await clientAlbumService.getAlbums({
        page: nextPage,
        limit: itemsPerPage
      });

      if (albumsResponse.success && albumsResponse.data.length > 0) {
        const formattedAlbums = albumsResponse.data.map(album => {
          const formattedItem = clientAlbumService.formatAlbumForDisplay(album, currentLanguage);

          return {
            id: album.id,
            slug: formattedItem.slug,
            title: formattedItem.title,
            description: formattedItem.description,
            date: formattedItem.createdAt,
            coverImage: formattedItem.featuredImage || clientAlbumService.getImageUrl(album.imageUrl) || 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image',
          };
        });

        setAlbums(prev => [...prev, ...formattedAlbums]);
        setCurrentPage(nextPage);
        setHasMore(albums.length + formattedAlbums.length < totalItems);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAlbumClick = (e, albumSlug) => {
    e.preventDefault();
    const prefix = currentLanguage === 'vi' ? '/thong-tin-cong-ty/thu-vien-cong-ty' : '/en/company/gallery';
    navigate(`${prefix}/${albumSlug}`, {
      state: { fromGalleryList: true }
    });
  };

  const generateStructuredData = () => {
    const collectionPage = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": t('frontend.companyInfo.gallery.seoTitle'),
      "description": t('frontend.companyInfo.gallery.seoDescription'),
      "hasPart": albums.map(album => ({
        "@type": "ImageGallery",
        "name": album.title,
        "description": album.description,
        "image": album.coverImage,
        "datePublished": album.date,
      })),
    };
    return JSON.stringify(collectionPage);
  };

  return (
    <>
      <SEO 
        title={t('frontend.companyInfo.gallery.pageTitle')}
        description={t('frontend.companyInfo.gallery.pageDescription')}
        url="/thong-tin-cong-ty/thu-vien-cong-ty"
      />

      <main className="gallery-container">
        <section className="gallery-header">
          <div className="section-title" data-aos="fade-up">
            <h1>{t('frontend.companyInfo.gallery.title')}</h1>
          </div>
        </section>

        <section className="gallery-content">
          <div className="gallery-grid" data-aos="fade-up" role="grid">
            {albums.map((album, index) => (
              <div
                key={album.id}
                className="gallery-item"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onClick={(e) => handleAlbumClick(e, album.slug)}
                role="link"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAlbumClick(e, album.slug);
                  }
                }}
              >
                <article className="gallery-item-inner">
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="gallery-thumbnail"
                    loading="lazy"
                  />
                  <div className="gallery-item-overlay">
                    <h2 className="media-title">{album.title}</h2>
                    <div className="media-metadata">
                      <time dateTime={album.date}>
                        {new Date(album.date).toLocaleDateString("vi-VN")}
                      </time>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="gallery-load-more" data-aos="fade-up">
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <i className="fas fa-chevron-down"></i>
                    Xem thêm
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Gallery; 