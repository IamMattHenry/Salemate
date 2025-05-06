import React, { useState, useEffect } from "react";
import { IoIosAdd, IoIosSearch, IoMdInformationCircle } from "react-icons/io";
import { MdCancel, MdDelete } from "react-icons/md";
import { FaEdit, FaCheckCircle } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "motion/react";
import successModal from "../../hooks/Modal/SuccessModal";
import DashboardCategory from "./DashboardCategory";
import { addProduct, updateProduct, deleteProduct } from "../../services/productService";

const ProductList = ({ products, addToOrderList, updateProducts, loading = false }) => {
  const { modal, toggleModal: originalToggleModal } = useModal();
  const { okayModal, showSuccessModal } = successModal();

  // Custom toggle modal function that also resets form fields
  const toggleModal = () => {
    // If the modal is currently open, reset all form fields when closing
    if (modal) {
      resetFormFields();
    }
    // Call the original toggle function
    originalToggleModal();
  };

  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [picture, setPicture] = useState(""); // State for the uploaded picture
  const [pictureFileName, setPictureFileName] = useState(""); // State for the uploaded picture filename
  const [category, setCategory] = useState(""); // State for the product category
  const [name, setName] = useState(""); // State for the product name
  const [description, setDescription] = useState(""); // State for the product description
  const [price, setPrice] = useState(""); // State for the product price
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal visibility
  const [currentProduct, setCurrentProduct] = useState(null); // State for the product being edited
  const [editPictureFileName, setEditPictureFileName] = useState(""); // State for the edited picture filename

  // New state variables for confirmation and success modals
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // State for delete confirmation modal
  const [isSaveSuccessOpen, setIsSaveSuccessOpen] = useState(false); // State for save success modal
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false); // State for delete success modal
  const [productToDelete, setProductToDelete] = useState(null); // State for the product to be deleted

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    description: "",
    price: "",
    picture: "",
    category: ""
  });

  // Validate form fields
  const validateForm = () => {
    const errors = {
      name: "",
      description: "",
      price: "",
      picture: "",
      category: ""
    };

    let isValid = true;

    // Validate name
    if (!name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    // Validate description
    if (!description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    // Validate price
    if (!price.trim()) {
      errors.price = "Price is required";
      isValid = false;
    } else if (isNaN(parseFloat(price))) {
      errors.price = "Price must be a number";
      isValid = false;
    }

    // Validate picture
    if (!picture) {
      errors.picture = "Picture is required";
      isValid = false;
    }

    // Validate category
    if (!category) {
      errors.category = "Category is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPicture(reader.result); // Set the picture URL
        setPictureFileName(file.name); // Store the filename
        // Clear picture validation error if it exists
        if (validationErrors.picture) {
          setValidationErrors({...validationErrors, picture: ""});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to reset all form fields
  const resetFormFields = () => {
    // Reset the input fields
    setName("");
    setDescription("");
    setPrice("");
    setPicture("");
    setPictureFileName("");
    setCategory("");

    // Reset validation errors
    setValidationErrors({
      name: "",
      description: "",
      price: "",
      picture: "",
      category: ""
    });
  };

  const handleAddProduct = async () => {
    // Validate the form first
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
      // Create new product object
      const newProduct = {
        title: name, // Use the name from state
        description: description, // Use the description from state
        price: price, // Use the price from state
        url: picture, // Use the uploaded picture URL
        category: category, // Use the selected category
      };

      // Add the product to Firestore
      await addProduct(newProduct);

      // Close the "Add Item" modal
      toggleModal();

      // Refresh the products list
      if (updateProducts) {
        await updateProducts();
      }

      // Show the success modal
      showSuccessModal();

      // Reset form fields is handled by toggleModal
    } catch (error) {
      console.error("Error adding product:", error);
      // You could show an error message here
    }
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product); // Set the product to be edited
    setEditPictureFileName(""); // Clear the edit picture filename
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleSaveProduct = async () => {
    if (currentProduct) {
      try {
        // Update the product in Firestore
        await updateProduct(currentProduct.id, currentProduct);

        // Refresh the products list
        if (updateProducts) {
          await updateProducts();
        }

        setIsEditModalOpen(false); // Close the edit modal
        setIsSaveSuccessOpen(true); // Show the save success modal
      } catch (error) {
        console.error("Error updating product:", error);
        // You could show an error message here
      }
    }
  };

  // Function to show delete confirmation modal
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  // Function to actually delete the product after confirmation
  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        // Delete the product from Firestore
        await deleteProduct(productToDelete.id);

        // Refresh the products list
        if (updateProducts) {
          await updateProducts();
        }

        setIsDeleteConfirmOpen(false); // Close the confirmation modal
        setIsEditModalOpen(false); // Close the edit modal if open
        setIsDeleteSuccessOpen(true); // Show the delete success modal
      } catch (error) {
        console.error("Error deleting product:", error);
        // You could show an error message here
      }
    }
  };

  // Function to cancel delete operation
  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  // Function to add product to order list
  const handleAddToOrder = (product) => {
    // Call the parent function to add the product to order list
    if (addToOrderList) {
      addToOrderList(product);
    }
  };

  // Filter products based on search query
  const filteredProducts = products ? products.filter((product) => {
    return product.title.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - Fixed height */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
          Menu Items
        </h2>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search items..."
              className="w-64 px-4 py-2 pl-10 bg-white border border-gray-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500
                       transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          </div>
          {/* Add Item Button */}
          <button
            onClick={toggleModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl
                     hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30"
          >
            <IoIosAdd className="text-xl" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Products Grid - Scrollable */}
      <div className="overflow-y-auto flex-1 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MdDelete className="text-4xl mb-2" />
            <p className="text-lg">No products found</p>
            <p className="text-sm">Add a new product to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px]">
            {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleAddToOrder(product)}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
                       hover:shadow-lg transition-all duration-300 relative h-[280px] flex flex-col"
            >
              {/* Product Image - Fixed height */}
              <div className="h-[140px] overflow-hidden flex-shrink-0">
                <img
                  src={product.url}
                  alt={product.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info - Fixed height */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProduct(product);
                    }}
                    className="p-2 text-gray-400 hover:text-amber-500 rounded-lg
                             opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <FaEdit className="text-lg" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-amber-600">₱{product.price}</span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-[32rem] rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
                  <button
                    onClick={toggleModal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <MdCancel className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Enter item name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (validationErrors.name) {
                          setValidationErrors({...validationErrors, name: ""});
                        }
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        validationErrors.name ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500`}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Enter item description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (validationErrors.description) {
                          setValidationErrors({...validationErrors, description: ""});
                        }
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        validationErrors.description ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500`}
                      rows="3"
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                    )}
                  </div>

                  {/* Price Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="text"
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (validationErrors.price) {
                          setValidationErrors({...validationErrors, price: ""});
                        }
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        validationErrors.price ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500`}
                    />
                    {validationErrors.price && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.price}</p>
                    )}
                  </div>

                  {/* Category Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (validationErrors.category) {
                          setValidationErrors({...validationErrors, category: ""});
                        }
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        validationErrors.category ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500`}
                    >
                      <option value="">Select category</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Meal">Meal</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                    {validationErrors.category && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                      <div className="space-y-1 text-center">
                        {pictureFileName ? (
                          <>
                            <div className="flex items-center justify-center mb-2">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm font-medium text-gray-900">{pictureFileName}</span>
                            </div>
                            <p className="text-xs text-gray-500">File selected. Click to change.</p>
                          </>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex justify-center text-sm text-gray-600">
                              <span className="font-medium text-amber-600 hover:text-amber-500">Upload a file</span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handlePictureUpload}
                        />
                      </div>
                    </label>
                    {validationErrors.picture && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.picture}</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white pt-4 pb-4 border-t border-gray-100 mt-6">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={toggleModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600
                               transition-colors shadow-lg shadow-amber-500/30"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditModalOpen && currentProduct && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-[32rem] rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Item</h3>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditPictureFileName("");
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <MdCancel className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Enter item name"
                      value={currentProduct.title}
                      onChange={(e) => {
                        setCurrentProduct({
                          ...currentProduct,
                          title: e.target.value
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Enter item description"
                      value={currentProduct.description}
                      onChange={(e) => {
                        setCurrentProduct({
                          ...currentProduct,
                          description: e.target.value
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      rows="3"
                    />
                  </div>

                  {/* Price Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="text"
                      placeholder="Enter price"
                      value={currentProduct.price}
                      onChange={(e) => {
                        setCurrentProduct({
                          ...currentProduct,
                          price: e.target.value
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  {/* Category Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={currentProduct.category}
                      onChange={(e) => {
                        setCurrentProduct({
                          ...currentProduct,
                          category: e.target.value
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    >
                      <option value="">Select category</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Meal">Meal</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>

                  {/* Image Preview and Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    {currentProduct.url && (
                      <div className="mb-3 flex justify-center">
                        <img
                          src={currentProduct.url}
                          alt={currentProduct.title}
                          className="h-40 w-auto object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                      <div className="space-y-1 text-center">
                        {editPictureFileName ? (
                          <>
                            <div className="flex items-center justify-center mb-2">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm font-medium text-gray-900">{editPictureFileName}</span>
                            </div>
                            <p className="text-xs text-gray-500">New file selected. Click to change.</p>
                          </>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex justify-center text-sm text-gray-600">
                              <span className="font-medium text-amber-600 hover:text-amber-500">Upload a new image</span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setCurrentProduct({
                                  ...currentProduct,
                                  url: reader.result
                                });
                                setEditPictureFileName(file.name);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white pt-4 pb-4 border-t border-gray-100 mt-6">
                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => confirmDelete(currentProduct)}
                      className="px-4 py-2 text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsEditModalOpen(false);
                          setEditPictureFileName("");
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProduct}
                        className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600
                                 transition-colors shadow-lg shadow-amber-500/30"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && productToDelete && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-[400px] rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <FiAlertCircle className="text-red-500 text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  </div>
                  <button
                    onClick={cancelDelete}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <MdCancel className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <span className="font-semibold">{productToDelete.title}</span>? This action cannot be undone.
                </p>

                {/* Product Preview */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                  <img
                    src={productToDelete.url}
                    alt={productToDelete.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{productToDelete.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{productToDelete.description}</p>
                    <p className="text-amber-600 font-medium mt-1">₱{productToDelete.price}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                  >
                    Delete Item
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Success Modal */}
      <AnimatePresence>
        {isSaveSuccessOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[360px] rounded-2xl shadow-2xl overflow-hidden text-center p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <FaCheckCircle className="w-8 h-8 text-amber-500" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Changes Saved
                </h3>

                <p className="text-gray-500 mb-6">
                  Your changes have been successfully saved
                </p>

                <button
                  onClick={() => setIsSaveSuccessOpen(false)}
                  className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Success Modal */}
      <AnimatePresence>
        {isDeleteSuccessOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[360px] rounded-2xl shadow-2xl overflow-hidden text-center p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <MdDelete className="w-8 h-8 text-red-500" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Product Deleted
                </h3>

                <p className="text-gray-500 mb-6">
                  The product has been successfully removed
                </p>

                <button
                  onClick={() => setIsDeleteSuccessOpen(false)}
                  className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;