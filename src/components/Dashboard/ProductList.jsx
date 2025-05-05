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
    <>
      {/* Success Modal */}
      <AnimatePresence>
        {okayModal && (
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white size-[17rem] rounded-4xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-4xl flex items-center flex-col text-black pt-4 px-3">
                <div className="flex items-center flex-col text-center space-x-1.5">
                  <FaCheckCircle className="size-19 text-[#0cd742]" />
                  <span className="font-bold text-2xl pt-1 mt-2">
                    Item Successfully Added
                  </span>
                  <div>
                    <div className="w-auto h-auto justify-center flex flex-col items-center mt-2">
                      <div className="space-y-2 w-[80%]">
                        <span className="text-[.9rem]">
                          Congrats! You have successfully added an item
                        </span>
                      </div>
                      <button
                        className="bg-[#0cd742] text-white text-center py-1 mt-1 px-7 rounded-2xl border-[0.5px] border-black text-[0.875rem] cursor-pointer hover:bg-black/70"
                        type="submit"
                        onClick={() => {
                          showSuccessModal(); // Close the success modal
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toggle Product Adding Modal */}
      {modal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white h-120 w-112 rounded-xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
                <div className="flex items-center text-center justify-center space-x-1.5">
                  <IoMdInformationCircle className="text-[1rem]" />
                  <span className="font-semibold text-[1rem] pt-1">Add Item</span>
                </div>
                <div>
                  <MdCancel className="cursor-pointer" onClick={toggleModal} />
                </div>
              </div>
              <div className="w-auto h-auto justify-center flex flex-col items-center pt-5">
                <div className="space-y-2">
                  {/* Description Field */}
                  <span className="text-lg">Description:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Type description"
                        className={`font-lato border-[1px] ${validationErrors.description ? 'border-red-500' : 'border-gray-500'} pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-[1rem] placeholder:text-gray-500 min-w-[20rem] bg-gray-300 shadow`}
                        value={description} // Bind to state
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (validationErrors.description) {
                            setValidationErrors({...validationErrors, description: ""});
                          }
                        }} // Update state on change
                      />
                      <FaEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[1rem]" />
                    </div>
                    {validationErrors.description && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
                    )}
                  </div>
                  {/* Name Field */}
                  <span className="text-lg">Name:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Type any item name"
                        className={`font-lato border-[1px] ${validationErrors.name ? 'border-red-500' : 'border-gray-500'} pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-[1rem] placeholder:text-gray-500 w-full bg-gray-300 shadow`}
                        value={name} // Bind to state
                        onChange={(e) => {
                          setName(e.target.value);
                          if (validationErrors.name) {
                            setValidationErrors({...validationErrors, name: ""});
                          }
                        }} // Update state on change
                      />
                      <FaEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[1rem]" />
                    </div>
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  {/* Price Field */}
                  <span className="text-lg">Price:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Type item price"
                        className={`font-lato border-[1px] ${validationErrors.price ? 'border-red-500' : 'border-gray-500'} pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-[1rem] placeholder:text-gray-500 w-full bg-gray-300 shadow`}
                        value={price} // Bind to state
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (validationErrors.price) {
                            setValidationErrors({...validationErrors, price: ""});
                          }
                        }} // Update state on change
                      />
                      <FaEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[1rem]" />
                    </div>
                    {validationErrors.price && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>
                    )}
                  </div>

                  {/* Picture Upload Field */}
                  <span className="text-lg">Picture:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="file"
                        accept="image/*"
                        className={`font-lato border-[1px] ${validationErrors.picture ? 'border-red-500' : 'border-gray-500'} pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-[1rem] placeholder:text-gray-500 w-full bg-gray-300 shadow`}
                        onChange={(e) => handlePictureUpload(e)}
                      />
                    </div>
                    {validationErrors.picture && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.picture}</p>
                    )}
                  </div>

                  {/* Category Field */}
                  <span className="text-lg">Category:</span>
                  <div>
                    <div className="relative w-full">
                      <select
                        className={`font-lato border-[1px] ${validationErrors.category ? 'border-red-500' : 'border-gray-500'} pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-[1rem] w-full bg-gray-300 shadow`}
                        value={category} // Bind to state
                        onChange={(e) => {
                          setCategory(e.target.value);
                          if (validationErrors.category) {
                            setValidationErrors({...validationErrors, category: ""});
                          }
                        }} // Update state on change
                      >
                        <option value="" disabled>Select a category</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Meal">Meal</option>
                        <option value="Snacks">Snacks</option>
                      </select>
                    </div>
                    {validationErrors.category && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    className="bg-[#0cd742] text-white text-center py-1 mt-3 px-5.5 rounded-3xl text-[0.95rem] cursor-pointer hover:bg-black/70 border-[0.5px] border-black"
                    type="submit"
                    onClick={handleAddProduct}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* Edit Product Modal */}
      {isEditModalOpen && currentProduct && (
        <motion.div
          className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white h-auto w-[30rem] rounded-xl font-lato p-5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium">Name:</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={currentProduct.title}
                  onChange={(e) =>
                    setCurrentProduct({ ...currentProduct, title: e.target.value })
                  }
                />
              </div>
              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium">Description:</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={currentProduct.description}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              {/* Price Field */}
              <div>
                <label className="block text-sm font-medium">Price:</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={currentProduct.price}
                  onChange={(e) =>
                    setCurrentProduct({ ...currentProduct, price: e.target.value })
                  }
                />
              </div>
              {/* Picture Field */}
              <div>
                <label className="block text-sm font-medium">Picture:</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCurrentProduct({ ...currentProduct, url: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium">Category:</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={currentProduct.category}
                  onChange={(e) =>
                    setCurrentProduct({ ...currentProduct, category: e.target.value })
                  }
                >
                  <option value="Drinks">Drinks</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Meal">Meal</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-5">
              {/* Delete Button */}
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={() => handleDeleteProduct(currentProduct.id)}
              >
                Delete
              </button>
              {/* Save Button */}
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                onClick={handleSaveProduct}
              >
                Save
              </button>
              {/* Cancel Button */}
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      <div className="mt-10 w-full flex justify-between items-center">
        <h3 className="font-lato font-semibold text-2xl ml-6">ALL PRODUCTS</h3>
        <div className="relative w-2/5 mr-5">
          <input
            type="text"
            placeholder="Search"
            className="font-lato bg-white border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-sm placeholder:text-gray-500 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
          />
          <IoIosSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 mx-5 gap-4 mt-5 min-h-[10.25rem]">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-3xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat cursor-pointer relative"
            onClick={() => handleAddToOrder(product)} // Add this onClick handler
          >
            {/* Pencil Icon */}
            <FaEdit
              className="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-black"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                handleEditProduct(product);
              }} // Open the edit modal
            />
            <img
              src={product.url}
              alt="product-img"
              className="object-contain rounded-[50%] size-27.5 my-3"
            />
            <h3 className="font-latrue font-extrabold text-xl">{product.title}</h3>
            <span className="text-sm font-latrue -mb-1 tracking-tight w-10/12 text-gray-500 font-semibold">
              {product.description}
            </span>
            <span className="font-bold text-sm font-latrue mt-3">
              Price: {product.price}
            </span>
          </div>
        ))}

        {/* Add Item Box */}
        <div
          className="bg-white rounded-3xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat cursor-pointer"
          onClick={toggleModal}
        >
          <IoIosAdd className="text-gray-500 size-24" />
          <span className="font-medium text-sm font-latrue text-gray-500 mt-[-10px]">
            Add Item
          </span>
        </div>

        {/* Placeholder Boxes for Consistency */}
        {products && Array.from({
          length: (3 - ((filteredProducts.length + 1) % 3)) % 3, // Calculate remaining spaces
        }).map((_, index) => (
          <div
            key={index}
            className="bg-transparent rounded-3xl flex items-center justify-center flex-col py-3 px-5 text-center"
          ></div>
        ))}
      </div>
    </>
  );
};

export default ProductList;