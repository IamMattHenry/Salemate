import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUpload, FaFacebookF, FaInstagram, FaLinkedinIn, FaCheck } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseApp, { db } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const AdditionalInfoModal = ({ isOpen, onClose, onSkip }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userData, setUserData] = useState({
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    profilePicture: ""
  });

  const fileInputRef = useRef(null);
  const storage = getStorage(firebaseApp);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    try {
      setUploadingImage(true);

      // Create a reference to the storage location
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update local state
      setUserData({
        ...userData,
        profilePicture: downloadURL
      });

      console.log("Profile picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save additional information
  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Update the user profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        facebook: userData.facebook,
        instagram: userData.instagram,
        linkedin: userData.linkedin,
        profilePicture: userData.profilePicture,
        additionalInfoCompleted: true,
        lastUpdated: new Date().toISOString()
      });

      console.log("Additional information saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving additional information:", error);

      // Check if it's a permission error
      if (error.code === "permission-denied" ||
          error.message.includes("permission") ||
          error.message.includes("insufficient")) {
        alert("Error: You don't have permission to update your profile. Please contact the administrator.");
      } else {
        alert("Error saving profile information. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Skip additional information
  const handleSkip = () => {
    if (!currentUser) return;

    // Mark as skipped in Firestore
    const userDocRef = doc(db, "users", currentUser.uid);
    updateDoc(userDocRef, {
      additionalInfoCompleted: true,
      lastUpdated: new Date().toISOString()
    })
      .then(() => {
        console.log("Additional information skipped");
        onSkip();
      })
      .catch((error) => {
        console.error("Error marking additional information as skipped:", error);

        // Check if it's a permission error
        if (error.code === "permission-denied" ||
            error.message.includes("permission") ||
            error.message.includes("insufficient")) {
          alert("Error: You don't have permission to update your profile. Please contact the administrator.");
        } else {
          // Still allow the user to skip even if there's an error
          console.log("Proceeding despite error");
          onSkip();
        }
      });
  };

  if (!isOpen) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
      y: -10,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-white w-[90%] max-w-xl rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between px-6 py-4 bg-amber-500 text-white">
            <h2 className="text-xl font-bold">Complete Your Profile</h2>
            <button
              onClick={handleSkip}
              className="text-white hover:text-amber-200 transition-colors"
              aria-label="Skip"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <motion.div
            className="p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.p
              className="text-gray-600 mb-6"
              variants={itemVariants}
            >
              Please provide additional information to complete your profile. You can skip this step and complete it later.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Profile Picture and Personal Info */}
              <motion.div
                className="space-y-4"
                variants={itemVariants}
              >
                {/* Profile Picture */}
                <motion.div
                  className="flex flex-col items-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative w-40 h-40 mb-4">
                    {uploadingImage ? (
                      <motion.div
                        className="w-full h-full rounded-md bg-gray-200 flex items-center justify-center"
                        animate={{
                          boxShadow: ["0px 0px 0px rgba(245, 158, 11, 0)", "0px 0px 15px rgba(245, 158, 11, 0.5)", "0px 0px 0px rgba(245, 158, 11, 0)"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                      </motion.div>
                    ) : userData.profilePicture ? (
                      <motion.div
                        className="relative w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={userData.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <motion.button
                          onClick={() => setUserData({...userData, profilePicture: ""})}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          title="Remove photo"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTimes size={12} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-full h-full bg-gray-200 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "#e5e7eb",
                          boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaUpload className="text-gray-500 mb-2" size={24} />
                        <span className="text-sm text-gray-500">Upload Profile Picture</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleProfilePictureUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Phone Number */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <motion.input
                    type="text"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="0963XXXXXXX"
                    whileFocus={{ scale: 1.01, boxShadow: "0px 0px 4px rgba(245, 158, 11, 0.5)" }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 0963XXXXXXX (Philippines)</p>
                </motion.div>

                {/* Date of Birth */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <motion.input
                    type="date"
                    name="dateOfBirth"
                    value={userData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                    whileFocus={{ scale: 1.01, boxShadow: "0px 0px 4px rgba(245, 158, 11, 0.5)" }}
                  />
                </motion.div>

                {/* Gender */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <motion.select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                    whileFocus={{ scale: 1.01, boxShadow: "0px 0px 4px rgba(245, 158, 11, 0.5)" }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </motion.select>
                </motion.div>
              </motion.div>

              {/* Right Column - Address and Social Media */}
              <motion.div
                className="space-y-4"
                variants={itemVariants}
              >
                {/* Address */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <motion.textarea
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 h-32"
                    placeholder="Your address"
                    whileFocus={{ scale: 1.01, boxShadow: "0px 0px 4px rgba(245, 158, 11, 0.5)" }}
                  ></motion.textarea>
                </motion.div>

                {/* Social Media Links */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social Media Links</label>
                  <div className="space-y-2">
                    <motion.div
                      className="flex items-center"
                      variants={itemVariants}
                      whileHover={{ x: 2 }}
                    >
                      <FaFacebookF className="text-blue-600 mr-2" />
                      <motion.input
                        type="text"
                        name="facebook"
                        value={userData.facebook}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Facebook URL"
                        whileFocus={{ scale: 1.01, boxShadow: "0px 0px 4px rgba(245, 158, 11, 0.5)" }}
                      />
                    </motion.div>
                    <motion.div
                      className="flex items-center"
                      variants={itemVariants}
                      whileHover={{ x: 2 }}
                    >
                      <FaInstagram className="text-pink-600 mr-2" />
                      <motion.input
                        type="text"
                        name="instagram"
                        value={userData.instagram}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Instagram URL"
                        whileFocus={{ scale: 1.01, boxShadow: "0px 0px 4px rgba(245, 158, 11, 0.5)" }}
                      />
                    </motion.div>
                    <motion.div
                      className="flex items-center"
                      variants={itemVariants}
                      whileHover={{ x: 2 }}
                    >
                      <FaLinkedinIn className="text-blue-700 mr-2" />
                      <motion.input
                        type="text"
                        name="linkedin"
                        value={userData.linkedin}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="LinkedIn URL"
                        whileFocus={{ scale: 1.01, boxShadow: "0px 0px 4px rgba(245, 158, 11, 0.5)" }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="bg-gray-50 px-6 py-4 flex justify-end gap-2"
            variants={containerVariants}
          >
            <motion.button
              onClick={handleSkip}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              Skip for Later
            </motion.button>
            <motion.button
              onClick={handleSave}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              disabled={loading}
              whileHover={{ scale: 1.05, backgroundColor: "#d97706" }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Save and Continue</span>
                  <FaCheck className="ml-2" size={14} />
                </div>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdditionalInfoModal;
