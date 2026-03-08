import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clientAlbumService from "../../../../services/clientAlbumService";
import "./Gallery.css";
import { useI18n } from '../../../../hooks/useI18n';
import SEO from "../../../../components/SEO/SEO";

const Gallery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage } = useI18n();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const text = currentLanguage === 'vi' ? {
    title: "Thư viện ảnh",
    desc: "Hình ảnh hoạt động và sự kiện của công ty",
    noAlbums: "Chưa có album nào",
  } : {
    title: "Photo Gallery",
    desc: "Photos of company activities and events",
    noAlbums: "No albums yet",
  };

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setLoading(true);
        const response = await clientAlbumService.getAlbums({ page: 1, limit: 50 });

        if (response.success && response.data.length > 0) {
          const formattedAlbums = response.data.map(album => {
            const formatted = clientAlbumService.formatAlbumForDisplay(album, currentLanguage);
            return {
              id: album.id,
              slug: formatted.slug,
              title: formatted.title,
              coverImage: formatted.featuredImage || clientAlbumService.getImageUrl(album.imageUrl),
              imageCount: album.totalImages || 0,
            };
          });
          setAlbums(formattedAlbums);
        } else {
          setAlbums([]);
        }
      } catch (error) {
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [currentLanguage]);

  const handleAlbumClick = (slug) => {
    const prefix = currentLanguage === 'vi' ? '/thong-tin-cong-ty/thu-vien-anh' : '/en/company/photos';
    navigate(`${prefix}/${slug}`);
  };

  return (
    <>
      <SEO title={text.title + " | ATTECH"} url={location.pathname} />

      <div className="gallery-page">
        <div className="gallery-header">
          <h1 className="gallery-title">{text.title}</h1>
          <p className="gallery-desc">{text.desc}</p>
        </div>

        {loading ? (
          <div className="gallery-loading">
            <i className="fa fa-spinner fa-spin"></i>
          </div>
        ) : albums.length === 0 ? (
          <div className="gallery-empty">
            <i className="fa fa-images"></i>
            <p>{text.noAlbums}</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {albums.map((album) => (
              <div
                key={album.id}
                className="gallery-card"
                onClick={() => handleAlbumClick(album.slug)}
              >
                <div className="gallery-card-image">
                  <img src={album.coverImage} alt={album.title} loading="lazy" />
                </div>

                {album.imageCount > 0 && (
                  <span className="gallery-card-count">
                    <i className="fa fa-images"></i> {album.imageCount}
                  </span>
                )}

                <div className="gallery-card-info">
                  <h3 className="gallery-card-title">{album.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Gallery;
