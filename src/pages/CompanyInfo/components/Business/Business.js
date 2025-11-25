import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Business.css";
import AOS from "aos";
import "aos/dist/aos.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";

const Business = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const [contentHtml, setContentHtml] = useState("");

  const seoContent = {
    vi: {
      title: "Ngành nghề kinh doanh | ATTECH",
      description:
        "Tìm hiểu về các ngành nghề kinh doanh và lĩnh vực hoạt động của ATTECH, bao gồm dịch vụ hỗ trợ hàng không, CNS, sản xuất thiết bị và nhiều lĩnh vực khác.",
      keywords:
        "ngành nghề kinh doanh ATTECH, business fields, lĩnh vực hoạt động, aviation services",
    },
    en: {
      title: "Business Fields | ATTECH",
      description:
        "Learn about ATTECH's business fields and areas of operation, including aviation support services, CNS, equipment manufacturing and more.",
      keywords:
        "ATTECH business fields, aviation services, business activities, company operations",
    },
  };

  const currentSEO = seoContent[currentLanguage] || seoContent.vi;

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  // Load content from translation (managed via admin)
  useEffect(() => {
    const translationContent = t("frontend.companyInfo.business.fullContent", {
      returnObjects: true,
      defaultValue: "",
    });

    if (translationContent && typeof translationContent === "string") {
      setContentHtml(translationContent);
    }
  }, [t, currentLanguage]);

  const companyInfo = {
    authority:
      "SỞ KẾ HOẠCH VÀ ĐẦU TƯ THÀNH PHỐ HÀ NỘI - PHÒNG ĐĂNG KÝ KINH DOANH",
    motto: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc",
    certificate: {
      title:
        "GIẤY CHỨNG NHẬN ĐĂNG KÝ DOANH NGHIỆP\nCÔNG TY TRÁCH NHIỆM HỮU HẠN MỘT THÀNH VIÊN",
      enterpriseCode: "0104831665",
      firstRegistration: "ngày 09 tháng 08 năm 2010",
      lastChange: "Đăng ký thay đổi lần thứ 9: ngày 28 tháng 12 năm 2021",
    },
    name: {
      vietnamese: "CÔNG TY TNHH KỸ THUẬT QUẢN LÝ BAY",
      international: "AIR TRAFFIC TECHNICAL COMPANY LIMITED",
      short: "ATTECH CO.,LTD",
    },
    address: {
      full: "Số 5/200, đường Nguyễn Sơn, phường Bồ Đề, thành phố Hà Nội, Việt Nam",
      phone: "024.38271914",
      fax: "024.38720398",
      email: "attech@attech.com.vn",
      website: "attech.com.vn",
    },
  };

  const businessFields = [
    {
      id: 1,
      name: "Hoạt động dịch vụ hỗ trợ trực tiếp cho vận tải hàng không",
      details: [
        "Dịch vụ bay kiểm tra, hiệu chuẩn hệ thống kỹ thuật, thiết bị dẫn đường, giám sát hàng không;",
        "Đào tạo, huấn luyện nghiệp vụ cho nhân viên hàng không;",
        "Cung ứng dịch vụ thông tin, dẫn đường, giám sát hàng không;",
        "Hoạt động dịch vụ hỗ trợ trực tiếp khác cho vận tải hàng không;",
      ],
    },
    {
      id: 2,
      name: "Hoạt động dịch vụ hỗ trợ kinh doanh khác còn lại chưa được phân vào đâu",
      details: ["Xuất nhập khẩu các mặt hàng Công ty kinh doanh"],
    },
    { id: 3, name: "Dịch vụ hỗ trợ giáo dục" },
    { id: 4, name: "Giáo dục nghề nghiệp" },
    {
      id: 5,
      name: "Cung ứng và quản lý nguồn lao động",
      details: [
        "Chỉ hoạt động khi được cơ quan có thẩm quyền cấp phép, không bao gồm môi giới, giới thiệu, tuyển dụng và cung ứng lao động cho các Doanh nghiệp có chức năng xuất khẩu lao động và cung ứng, quản lý người lao động đi làm việc ở nước ngoài",
      ],
    },
    {
      id: 6,
      name: "Nghiên cứu và phát triển thực nghiệm khoa học tự nhiên và kỹ thuật",
    },
    {
      id: 7,
      name: "Hoạt động kiến trúc và tư vấn kỹ thuật có liên quan",
      details: [
        "Giám sát thi công xây dựng và hoàn thiện công trình dân dụng và công nghiệp, lĩnh vực chuyên môn giám sát: xây dựng và hoàn thiện;",
        "Thiết kế kết cấu công trình dân dụng và công nghiệp;",
        "Thiết kế kiến trúc công trình;",
        "Lập dự án đầu tư xây dựng công trình;",
        "Quản lý dự án đầu tư xây dựng công trình;",
        "Dịch vụ tư vấn lập hồ sơ mời thầu và đánh giá hồ sơ dự thầu;",
        "Tư vấn quản lý chi phí hạng 2:",
        "Lập, thẩm tra tổng mức đầu tư (trừ các dự án quan trọng quốc gia);",
        "Đánh giá hiệu quả dự án đầu tư xây dựng công trình (trừ các dự án quan trọng quốc gia);",
        "Xác định chỉ tiêu suất vốn đầu tư, định mức, đơn giá xây dựng công trình, chỉ số giá xây dựng;",
        "Đo bóc khối lượng xây dựng công trình;",
        "Lập, thẩm tra dự toán xây dựng công trình;",
        "Xác định giá gói thầu, giá hợp đồng trong hoạt động xây dựng;",
        "Kiểm soát chi phí xây dựng công trình (trừ các dự án quan trọng quốc gia);",
        "Lập hồ sơ thanh toán, quyết toán hợp đồng;",
        "Lập hồ sơ thanh toán, quyết toán vốn đầu tư xây dựng công trình (không bao gồm các hoạt động: lập, thẩm tra tổng mức đầu tư; Đánh giá hiệu quả dự án đầu tư xây dựng công trình và kiểm soát chi phí xây dựng công trình đối với các dự án trọng điểm quốc gia).",
      ],
    },
    {
      id: 8,
      name: "Xử lý dữ liệu, cho thuê và các hoạt động liên quan",
      details: [
        "Không bao gồm thiết lập mạng và kinh doanh hạ tầng bưu chính viễn thông",
      ],
    },
    {
      id: 9,
      name: "Hoạt động dịch vụ công nghệ thông tin và dịch vụ khác liên quan đến máy vi tính",
    },
    { id: 10, name: "Tư vấn máy vi tính và quản trị hệ thống máy vi tính" },
    { id: 11, name: "Lập trình máy vi tính" },
    {
      id: 12,
      name: "Hoạt động viễn thông không dây",
      details: [
        "Không bao gồm thiết lập mạng và kinh doanh hạ tầng bưu chính viễn thông",
      ],
    },
    {
      id: 13,
      name: "Hoạt động viễn thông có dây",
      details: [
        "Không bao gồm thiết lập mạng và kinh doanh hạ tầng bưu chính viễn thông",
      ],
    },
    {
      id: 14,
      name: "Nhà hàng và các dịch vụ ăn uống phục vụ lưu động",
      details: [
        "Không bao gồm kinh doanh quán bar, phòng hát karaoke, vũ trường",
      ],
    },
    { id: 15, name: "Dịch vụ lưu trú ngắn ngày" },
    {
      id: 16,
      name: "Bán lẻ máy vi tính, thiết bị ngoại vi, phần mềm và thiết bị viễn thông trong các cửa hàng chuyên doanh",
    },
    { id: 17, name: "Bán buôn máy móc, thiết bị và phụ tùng máy khác" },
    { id: 18, name: "Bán buôn thiết bị và linh kiện điện tử, viễn thông" },
    { id: 19, name: "Bán buôn máy vi tính, thiết bị ngoại vi và phần mềm" },
    {
      id: 20,
      name: "Bán phụ tùng và các bộ phận phụ trợ của ô tô và xe có động cơ khác",
    },
    { id: 21, name: "Bảo dưỡng, sửa chữa ô tô và xe có động cơ khác" },
    { id: 22, name: "Hoạt động xây dựng chuyên dụng khác" },
    { id: 23, name: "Hoàn thiện công trình xây dựng" },
    { id: 24, name: "Lắp đặt hệ thống xây dựng khác" },
    {
      id: 25,
      name: "Lắp đặt hệ thống cấp, thoát nước, lò sưởi và điều hòa không khí",
    },
    { id: 26, name: "Lắp đặt hệ thống điện" },
    { id: 27, name: "Xây dựng công trình kỹ thuật dân dụng khác" },
    { id: 28, name: "Xây dựng công trình công ích" },
    { id: 29, name: "Lắp đặt máy móc và thiết bị công nghiệp" },
    { id: 30, name: "Sửa chữa thiết bị khác" },
    { id: 31, name: "Sửa chữa thiết bị điện" },
    { id: 32, name: "Sửa chữa thiết bị điện tử và quang học" },
    { id: 33, name: "Sửa chữa máy móc, thiết bị" },
    { id: 34, name: "Sửa chữa các sản phẩm kim loại đúc sẵn" },
    { id: 35, name: "Sản xuất thiết bị điện khác" },
    { id: 36, name: "Sản xuất thiết bị điện chiếu sáng" },
    { id: 37, name: "Sản xuất thiết bị dây dẫn điện các loại" },
    { id: 38, name: "Sản xuất dây, cáp điện và điện tử khác" },
    {
      id: 39,
      name: "Sản xuất mô tơ, máy phát, biến thế điện, thiết bị phân phối và điều khiển điện",
    },
    { id: 40, name: "Sản xuất đồng hồ" },
    {
      id: 41,
      name: "Sản xuất thiết bị đo lường, kiểm tra, định hướng và điều khiển",
    },
    { id: 42, name: "Sản xuất sản phẩm điện tử dân dụng" },
    { id: 43, name: "Sản xuất thiết bị truyền thông" },
    { id: 44, name: "Sản xuất linh kiện điện tử" },
    { id: 45, name: "Gia công cơ khí; xử lý và tráng phủ kim loại" },
    { id: 46, name: "Sản xuất các cấu kiện kim loại" },
    {
      id: 47,
      name: "Cổng thông tin",
      details: ["Trừ các loại thông tin Nhà nước cấm và hoạt động báo chí"],
    },
    {
      id: 48,
      name: "Kinh doanh bất động sản, quyền sử dụng đất thuộc chủ sở hữu, chủ sử dụng hoặc đi thuê",
      details: [
        "Cho thuê tài sản trên đất, cho thuê văn phòng, mặt bằng kinh doanh",
      ],
    },
  ];

  // If content exists from translation system, use it. Otherwise, use hardcoded content
  const useTranslationContent = contentHtml && contentHtml.trim() !== "";

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="business-fields">
        {useTranslationContent ? (
          // Render content from translation (managed via admin)
          <div
            className="managed-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          // Fallback to hardcoded content (legacy)
          <>
        <section className="certificate-section">
          <div className="certificate-header" data-aos="fade-up">
            <h1>{companyInfo.authority}</h1>
            <hr className="divider" />
            <p>{companyInfo.motto}</p>
            <hr className="divider" />
          </div>
          <div
            className="certificate-info"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h2>{companyInfo.certificate.title}</h2>
            <p>
              <strong>Mã số doanh nghiệp:</strong>{" "}
              {companyInfo.certificate.enterpriseCode}
            </p>
            <p>
              <strong>Đăng ký lần đầu:</strong>{" "}
              {companyInfo.certificate.firstRegistration}
            </p>
            <p>
              <strong>{companyInfo.certificate.lastChange}</strong>
            </p>
          </div>
          <div
            className="company-details"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h3>1. Tên Công Ty</h3>
            <p>
              <strong>Tiếng Việt:</strong> {companyInfo.name.vietnamese}
            </p>
            <p>
              <strong>Quốc tế:</strong> {companyInfo.name.international}
            </p>
            <p>
              <strong>Viết tắt:</strong> {companyInfo.name.short}
            </p>

            <h3>2. Địa Chỉ Trụ Sở Chính</h3>
            <p>{companyInfo.address.full}</p>
            <p>
              <strong>Điện thoại:</strong> {companyInfo.address.phone}{" "}
              <strong>Fax:</strong> {companyInfo.address.fax}
            </p>
            <p>
              <strong>Email:</strong> {companyInfo.address.email}{" "}
              <strong>Website:</strong>{" "}
              <a
                href={`https://${companyInfo.address.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {companyInfo.address.website}
              </a>
            </p>
          </div>
        </section>

        <section className="fields-section">
          <h3 data-aos="fade-up">3. Ngành, Nghề Kinh Doanh</h3>
          <div className="fields-list">
            {businessFields.map((field, index) => (
              <div
                key={field.id}
                className="field-item"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <p>
                  <strong>{field.id}.</strong> {field.name}
                </p>
                {field.details && (
                  <div className="field-details">
                    <p>
                      <strong>Chi tiết:</strong>
                    </p>
                    <ul>
                      {field.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="note" data-aos="fade-up">
            (Đối với các ngành nghề kinh doanh có điều kiện, Doanh nghiệp chỉ
            kinh doanh khi có đủ điều kiện theo quy định của pháp luật)
          </p>
        </section>
          </>
        )}
      </div>
    </>
  );
};

export default Business;
