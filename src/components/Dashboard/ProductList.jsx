import React, { useState, useEffect } from "react";
import { IoIosAdd, IoIosSearch, IoMdInformationCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FaEdit, FaCheckCircle } from "react-icons/fa";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "motion/react";
import successModal from "../../hooks/Modal/SuccessModal";
import DashboardCategory from "./DashboardCategory";

const ProductList = ({ products, addToOrderList, updateProducts }) => {
  const { modal, toggleModal } = useModal();
  const { okayModal, showSuccessModal } = successModal();

  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [picture, setPicture] = useState(""); // State for the uploaded picture
  const [category, setCategory] = useState(""); // State for the product category
  const [name, setName] = useState(""); // State for the product name
  const [description, setDescription] = useState(""); // State for the product description
  const [price, setPrice] = useState(""); // State for the product price
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal visibility
  const [currentProduct, setCurrentProduct] = useState(null); // State for the product being edited

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
        // Clear picture validation error if it exists
        if (validationErrors.picture) {
          setValidationErrors({...validationErrors, picture: ""});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    // Validate the form first
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    // Get all existing products from parent component by calling updateProducts with a callback
    if (updateProducts) {
      updateProducts((currentProducts) => {
        // Generate a unique ID that's greater than any existing ID
        const maxId = Math.max(...currentProducts.map(product => product.id), 0);
        const newProduct = {
          id: maxId + 1,
          title: name, // Use the name from state
          description: description, // Use the description from state
          price: price, // Use the price from state
          url: picture, // Use the uploaded picture URL
          category: category, // Use the selected category
        };

        // Add the new product to the parent's product list
        const updatedProducts = [...currentProducts, newProduct];

        // Close the "Add Item" modal
        toggleModal();

        // Show the success modal
        showSuccessModal();

        // Reset the input fields
        setName("");
        setDescription("");
        setPrice("");
        setPicture("");
        setCategory("");

        // Reset validation errors
        setValidationErrors({
          name: "",
          description: "",
          price: "",
          picture: "",
          category: ""
        });

        return updatedProducts;
      });
    }
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product); // Set the product to be edited
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleSaveProduct = () => {
    if (updateProducts && currentProduct) {
      updateProducts((currentProducts) => {
        const index = currentProducts.findIndex((product) => product.id === currentProduct.id);
        if (index !== -1) {
          const updatedProductList = [...currentProducts];
          updatedProductList[index] = currentProduct;
          return updatedProductList;
        }
        return currentProducts;
      });
    }
    setIsEditModalOpen(false); // Close the modal
  };

  const handleDeleteProduct = (id) => {
    if (updateProducts) {
      updateProducts((currentProducts) => {
        return currentProducts.filter(product => product.id !== id);
      });
    }
    setIsEditModalOpen(false); // Close the modal
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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => handleAddToOrder(product)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
                     hover:shadow-lg transition-all duration-300 relative"
          >
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-9 overflow-hidden">
              <img
                src={product.url}
                alt={product.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Product Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{product.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProduct(product);
                  }}
                  className="p-2 text-gray-400 hover:text-amber-500 rounded-lg
                           opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaEdit className="text-lg" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-amber-600">₱{product.price}</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
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
              className="bg-white w-[32rem] rounded-2xl shadow-xl"
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
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                      <div className="space-y-1 text-center">
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
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handlePictureUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    {validationErrors.picture && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.picture}</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;