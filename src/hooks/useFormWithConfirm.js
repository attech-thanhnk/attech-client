import { useState, useCallback } from "react";

/**
 * Custom hook để xử lý form state và confirm dialog
 * @param {Object} emptyData - Dữ liệu mặc định cho form
 * @param {Array} fieldsToCompare - Các field cần so sánh khi check thay đổi
 * @param {Function} onClose - Callback khi đóng form
 */
export const useFormWithConfirm = (
  emptyData,
  fieldsToCompare = [],
  onClose = null
) => {
  const [currentData, setCurrentData] = useState({ ...emptyData });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false); // Track thay đổi

  // Kiểm tra xem có dữ liệu thay đổi không
  const hasUnsavedChanges = useCallback(() => {
    if (!originalData) return false;

    return fieldsToCompare.some(
      (field) => currentData[field] !== originalData[field]
    );
  }, [originalData, currentData, fieldsToCompare]);

  // Reset form function - phải khai báo trước
  const resetForm = useCallback(() => {
    setCurrentData({ ...emptyData });
    setEditMode(false);
    setErrors({});
    setShowModal(false);
    setOriginalData(null);
    setHasChanges(false); // Reset thay đổi

    if (onClose) {
      onClose();
    }
  }, [emptyData, onClose]);

  // Handle close modal - sử dụng hasChanges
  const handleCloseModal = useCallback(() => {
    // Chỉ hiển thị confirm nếu có thay đổi hoặc có dữ liệu chưa lưu
    const hasUnsaved = hasUnsavedChanges();

    if (hasChanges || hasUnsaved) {
      const confirmMessage = editMode
        ? "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn hủy bỏ?"
        : "Bạn có dữ liệu chưa lưu. Bạn có chắc chắn muốn hủy bỏ?";

      if (window.confirm(confirmMessage)) {
        resetForm();
      }
    } else {
      // Nếu không có thay đổi gì, đóng ngay lập tức
      resetForm();
    }
  }, [hasChanges, hasUnsavedChanges, editMode, resetForm]);

  const handleAddNew = useCallback(() => {
    setEditMode(false);
    setCurrentData({ ...emptyData });
    setOriginalData(null);
    setErrors({});
    setHasChanges(false); // Reset thay đổi
    setShowModal(true);
  }, [emptyData]);

  const handleEdit = useCallback((item) => {
    setEditMode(true);
    // Nếu status đã là string rồi thì giữ nguyên, nếu là number thì chuyển đổi
    const convertedStatus =
      typeof item.status === "string"
        ? item.status
        : item.status === 1 || item.status === true
        ? "active"
        : "inactive";

    const itemWithConvertedStatus = {
      ...item,
      status: convertedStatus,
    };setCurrentData(itemWithConvertedStatus);
    setOriginalData(itemWithConvertedStatus);
    setErrors({});
    setHasChanges(false); // Reset thay đổi
    setShowModal(true);
  }, []);

  const handleInputChange = useCallback(
    (field, value) => {
      setCurrentData((prev) => ({ ...prev, [field]: value }));
      setHasChanges(true); // Đánh dấu có thay đổi

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const setFieldError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Debug function để kiểm tra dữ liệu form
  const debugFormData = useCallback(() => {
    const textFields = [
      "titleVi",
      "titleEn",
      "descriptionVi",
      "descriptionEn",
      "slugVi",
      "slugEn",
    ];

    const formData = {};
    textFields.forEach((field) => {
      const value = currentData[field];
      formData[field] = {
        value: value,
        hasData: value && value.trim() && value.trim().length > 0,
        trimmedLength: value ? value.trim().length : 0,
      };
    });

    // Debug information available in formData object

    return formData;
  }, [currentData, hasChanges, hasUnsavedChanges]);

  return {
    // State
    currentData,
    editMode,
    showModal,
    errors,
    submitLoading,
    originalData,
    hasChanges,

    // Actions
    setCurrentData,
    setEditMode,
    setShowModal,
    setErrors,
    setSubmitLoading,
    setOriginalData,
    setHasChanges,

    // Handlers
    handleCloseModal,
    resetForm,
    handleAddNew,
    handleEdit,
    handleInputChange,
    setFieldError,
    clearErrors,

    // Utilities
    hasUnsavedChanges,
    debugFormData,
  };
};
