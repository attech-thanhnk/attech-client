import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "../../../../hooks/useI18n";
import { useLocalizedRouting } from "../../../../hooks/useLocalizedRouting";
import ProductItem from "../ProductItem/ProductItem";
import Sidebar from "../Sidebar/Sidebar";
import "../ProductList/ProductList.css";
import {
  getProducts,
  getProductCategories,
} from "../../../../services/clientProductService";
import { getApiBaseUrl } from "../../../../config/apiConfig";

// CategoryNav component with i18n
const CategoryNav = ({ categories, selectedCategory, onSelectCategory, t }) => {
  return (
    <div className="attech-category-nav">
      <button
        className={`attech-category-btn ${!selectedCategory ? "active" : ""}`}
        onClick={() => onSelectCategory("")}
      >
        {t("frontend.products.allProducts")}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          className={`attech-category-btn ${
            selectedCategory === cat.slug ? "active" : ""
          }`}
          onClick={() => onSelectCategory(cat.slug)}
        >
          {cat.name}
        </button>
      ))}
      <button
        className="attech-category-btn"
        onClick={() => window.open("https://attech.vr360.one/", "_blank")}
      >
        VR 360
      </button>
    </div>
  );
};

const ProductList = () => {
  const { category } = useParams();
  const { t, currentLanguage } = useI18n();
  const { navigateToRoute } = useLocalizedRouting();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [favoriteProducts, setFavoriteProducts] = useState(() => {
    const saved = localStorage.getItem("favoriteProducts");
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ThÃªm state cho phÃ¢n trang
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // ThÃªm state Ä‘á»ƒ theo dÃµi kÃ­ch thÆ°á»›c mÃ n hÃ¬nh
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load products - use category slug if selected
        const productsParams = { limit: 50 };
        if (category) {
          productsParams.categorySlug = category;
        }
        const productsResponse = await getProducts(productsParams);
        if (
          productsResponse.status === 1 &&
          productsResponse.data?.items?.length > 0
        ) {
          const formattedProducts = productsResponse.data.items.map(
            (product) => ({
              id: product.id,
              slug: currentLanguage === "vi" ? product.slugVi : product.slugEn,
              title:
                currentLanguage === "vi" ? product.titleVi : product.titleEn,
              fullTitle:
                currentLanguage === "vi" ? product.titleVi : product.titleEn,
              category:
                currentLanguage === "vi"
                  ? product.productCategoryTitleVi
                  : product.productCategoryTitleEn,
              description:
                currentLanguage === "vi"
                  ? product.descriptionVi
                  : product.descriptionEn,
              image: product.imageUrl
                ? product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `${getApiBaseUrl()}${product.imageUrl}`
                : "/images/default-product.jpg",
              categorySlug:
                currentLanguage === "vi"
                  ? product.productCategorySlugVi
                  : product.productCategorySlugEn,
              status: product.status,
            })
          );
          const finalProducts = formattedProducts.filter((p) => p.status === 1);
          setProducts(finalProducts);
        } else {
          setProducts([]);
        }

        // Load categories
        const categoriesResponse = await getProductCategories();
        if (categoriesResponse.success && categoriesResponse.data?.length > 0) {
          const formattedCategories = categoriesResponse.data.map((cat) => ({
            name: currentLanguage === "vi" ? cat.titleVi : cat.titleEn,
            slug: currentLanguage === "vi" ? cat.slugVi : cat.slugEn,
          }));
          setCategories(formattedCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentLanguage, category]);

  // Äá»“ng bá»™ selectedCategory vá»›i route
  useEffect(() => {
    setSelectedCategory(category || "");
  }, [category]);

  useEffect(() => {
    let result = [...products];

    if (selectedCategory) {
      const beforeFilter = result.length;
      result = result.filter(
        (product) => product.categorySlug === selectedCategory
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const beforeFilter = result.length;
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.title || "").localeCompare(b.title || "");
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        default:
          return 0;
      }
    });
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedCategory, searchTerm, sortBy]);


  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const navigate = useNavigate();
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsSidebarOpen(false);
    if (category) {
      navigateToRoute("PRODUCT_CATEGORY", { category });
    } else {
      navigateToRoute("PRODUCTS");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleToggleFavorite = (product) => {
    setFavoriteProducts((prev) => {
      const isFavorite = prev.some((p) => p.id === product.id);
      if (isFavorite) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };


  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];

      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);

        if (currentPage > 3) {
          pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) {
            pages.push(i);
          }
        }

        if (currentPage < totalPages - 2) {
          pages.push('...');
        }

        if (!pages.includes(totalPages)) {
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="attech-pagination">
        <button
          className="attech-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
        {"<"}
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="attech-pagination-ellipsis">...</span>
          ) : (
            <button
              key={page}
              className={`attech-pagination-button ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        ))}

        <button
          className="attech-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
        {">"}
        </button>
      </div>
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (loading) {
    return (
      <div className="text-center" style={{ padding: "50px" }}>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p>{t("frontend.products.loading")}</p>
      </div>
    );
  }

  return (
    <div
      className="attech-product-list-container"
      style={{ paddingTop: "20px" }}
    >
      <div className="attech-controls-wrapper">
        <div className="attech-controls-inner">
          <div className="attech-controls-top">
            <button
              className="attech-filter-toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fas fa-filter"></i>
              <span>{currentLanguage === "en" ? "Categories" : "Danh mục"}</span>
            </button>

            <div className="attech-search-container">
              <i className="fas fa-search attech-search-icon"></i>
              <input
                type="text"
                className="attech-search-input"
                placeholder={t("frontend.products.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="attech-product-filters">
              <select
                className="attech-sort-select"
                value={sortBy}
                onChange={handleSort}
              >
                <option value="name">
                  {t("frontend.products.sortByName")}
                </option>
                <option value="category">
                  {t("frontend.products.sortByCategory")}
                </option>
              </select>

              <div className="attech-view-mode">
                <button
                  className={`attech-view-btn ${
                    viewMode === "grid" ? "active" : ""
                  }`}
                  onClick={() => handleViewMode("grid")}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  className={`attech-view-btn ${
                    viewMode === "list" ? "active" : ""
                  }`}
                  onClick={() => handleViewMode("list")}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="attech-controls-bottom">
            <CategoryNav
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
              t={t}
            />
          </div>
        </div>
      </div>

      <div
        className={`attech-product-grid ${viewMode} ${
          windowWidth <= 480
            ? "force-mobile-tiny"
            : windowWidth <= 768
            ? "force-mobile"
            : windowWidth <= 992
            ? "force-tablet"
            : "force-desktop"
        }`}
      >
        {loading ? (
          <div>Loading products...</div>
        ) : currentProducts.length > 0 ? (
          currentProducts.map((product, index) => (
            <div
              key={product.id}
              className="attech-product-item-wrapper"
              style={{
                animation: `fadeIn 0.3s ease-in-out forwards ${index * 0.1}s`,
              }}
            >
              <ProductItem
                product={product}
                viewMode={viewMode}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favoriteProducts.some((p) => p.id === product.id)}
              />
            </div>
          ))
        ) : (
          <div
            className="attech-no-products"
            style={{ padding: "40px", textAlign: "center" }}
          >
            <i className="fas fa-box-open"></i>
            <p>{t("frontend.products.noProductsFound")}</p>
          </div>
        )}
      </div>

      {currentProducts.length > 0 && <Pagination />}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedCategories={[selectedCategory]}
        onCategoryChange={handleCategoryChange}
        products={products}
      />
    </div>
  );
};

export default ProductList;
