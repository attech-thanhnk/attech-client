import React, { useEffect } from "react";

const SEO = ({
  title = "ATTECH - Công ty TNHH Kỹ thuật Quản lý bay",
  description = "ATTECH là công ty hàng đầu trong lĩnh vực kỹ thuật hàng không, cung cấp dịch vụ CNS, bay kiểm tra hiệu chuẩn và sản xuất thiết bị hàng không chất lượng cao.",
  keywords = "ATTECH, kỹ thuật hàng không, CNS, quản lý bay, bay kiểm tra, thiết bị hàng không, Vietnam aviation",
  image = null,
  url = "",
  type = "website",
  locale = "vi_VN",
  siteName = "ATTECH Vietnam",
}) => {
  const fullUrl = `${window.location.origin}${url}`;
  const fullImageUrl = image
    ? (image.startsWith("http") ? image : `${window.location.origin}${image}`)
    : null;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Function to update or create meta tag
    const updateMetaTag = (name, content, property = false) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);

      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Update canonical link
    const updateCanonical = (href) => {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", href);
    };

    // Basic Meta Tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", "ATTECH Vietnam");
    updateMetaTag("robots", "index, follow");
    updateMetaTag("language", locale);
    updateCanonical(fullUrl);

    // Open Graph Meta Tags
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    if (fullImageUrl) updateMetaTag("og:image", fullImageUrl, true);
    updateMetaTag("og:url", fullUrl, true);
    updateMetaTag("og:site_name", siteName, true);
    updateMetaTag("og:locale", locale, true);

    // Twitter Card Meta Tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    if (fullImageUrl) updateMetaTag("twitter:image", fullImageUrl);

    // Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ATTECH - Công ty TNHH Kỹ thuật Quản lý bay",
      url: window.location.origin,
      ...(fullImageUrl && { logo: fullImageUrl }),
      description: description,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+84-24-38271914",
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: ["vi", "en"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Số 5/200 đường Nguyễn Sơn, phường Bồ Đề",
        addressLocality: "Thành phố Hà Nội",
        addressCountry: "VN",
      },
      sameAs: [
        "https://www.facebook.com/attech.com.vn",
        "https://www.vietnamworks.com/nha-tuyen-dung/cong-ty-tnhh-ky-thuat-quan-ly-bay-c331815",
      ],
    };

    // Add or update structured data script
    let structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (!structuredDataScript) {
      structuredDataScript = document.createElement("script");
      structuredDataScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
  }, [
    title,
    description,
    keywords,
    fullUrl,
    fullImageUrl,
    type,
    locale,
    siteName,
  ]);

  return null;
};

export default SEO;
