import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author = 'ATTECH Corporation',
  siteName = 'ATTECH',
  locale = 'vi_VN',
  noIndex = false,
}) => {
  // Lấy domain từ window.location
  const siteUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : '';

  // Default image - logo của ATTECH
  const defaultImage = `${siteUrl}/images/logo.png`;

  const seo = {
    title: title ? `${title} | ${siteName}` : siteName,
    description: description || 'ATTECH - Công ty TNHH Kỹ thuật Quản lý bay',
    image: image || defaultImage,
    url: url || (typeof window !== 'undefined' ? window.location.href : ''),
    keywords: keywords || 'ATTECH, kỹ thuật hàng không, CNS, quản lý bay',
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={seo.url} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Additional Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Vietnamese" />
    </Helmet>
  );
};

export default SEO;
