import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaFacebookF, FaInstagram, FaLinkedinIn, FaUpload } from "react-icons/fa";
import { BsPersonCircle } from "react-icons/bs";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import firebaseApp from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const AccountDetailsModal = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    phoneNumber: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    profilePicture: ""
  });
  const [activeTab, setActiveTab] = useState("contact");
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  // Fetch complete user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            department: data.department || "",
            dateOfBirth: data.dateOfBirth || "",
            gender: data.gender || "",
            address: data.address || "",
            phoneNumber: data.phoneNumber || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            linkedin: data.linkedin || "",
            profilePicture: data.profilePicture || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [currentUser, db, isOpen]);

  // Handle social media link clicks
  const handleSocialMediaClick = (url) => {
    if (!url) return;

    // Add https:// if not present
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    window.open(fullUrl, '_blank');
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

      // Update the user profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        profilePicture: downloadURL
      });

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

  // Handle profile picture removal
  const handleRemoveProfilePicture = async () => {
    if (!currentUser || !userData.profilePicture) return;

    try {
      setUploadingImage(true);

      // Create a reference to the storage location
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);

      // Delete the file from storage
      try {
        await deleteObject(storageRef);
      } catch (error) {
        console.log("File may not exist in storage:", error);
      }

      // Update the user profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        profilePicture: ""
      });

      // Update local state
      setUserData({
        ...userData,
        profilePicture: ""
      });

      console.log("Profile picture removed successfully");
    } catch (error) {
      console.error("Error removing profile picture:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  // Save profile changes
  const handleSaveProfile = async () => {
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
        linkedin: userData.linkedin
      });

      setIsEditing(false);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-white w-[90%] max-w-xl rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Profile Picture and Name */}
          <div className="flex flex-col items-center pt-8 pb-6">
            <div className="relative w-40 h-40 mb-4">
              {uploadingImage ? (
                <div className="w-full h-full rounded-md bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : userData.profilePicture ? (
                <div className="relative w-full h-full">
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    title="Remove photo"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ) : (
                <div
                  className="w-full h-full bg-gray-200 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaUpload className="text-gray-500 mb-2" size={24} />
                  <span className="text-xs text-gray-500">Upload</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center">
              {userData.firstName} {userData.lastName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{userData.department}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "contact"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("contact")}
            >
              Contact Info
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "additional"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("additional")}
            >
              Additional Info
            </button>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[250px]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : (
              <>
                {activeTab === "contact" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email:</h4>
                      <p className="text-gray-800">{userData.email}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone:</h4>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phoneNumber"
                          value={userData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="+1234567890"
                        />
                      ) : (
                        <p className="text-gray-800">{userData.phoneNumber || "Not provided"}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date of Birth:</h4>
                      {isEditing ? (
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={userData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      ) : (
                        <p className="text-gray-800">{userData.dateOfBirth || "Not provided"}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Gender:</h4>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={userData.gender}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <p className="text-gray-800">{userData.gender || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "additional" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address:</h4>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={userData.address}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="Your address"
                        />
                      ) : (
                        <p className="text-gray-800">{userData.address || "Not provided"}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Social Media:</h4>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FaFacebookF className="text-blue-600 mr-2" />
                            <input
                              type="text"
                              name="facebook"
                              value={userData.facebook}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                              placeholder="Facebook URL"
                            />
                          </div>
                          <div className="flex items-center">
                            <FaInstagram className="text-pink-600 mr-2" />
                            <input
                              type="text"
                              name="instagram"
                              value={userData.instagram}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                              placeholder="Instagram URL"
                            />
                          </div>
                          <div className="flex items-center">
                            <FaLinkedinIn className="text-blue-700 mr-2" />
                            <input
                              type="text"
                              name="linkedin"
                              value={userData.linkedin}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                              placeholder="LinkedIn URL"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 mt-2">
                          {userData.facebook && (
                            <button
                              onClick={() => handleSocialMediaClick(userData.facebook)}
                              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                            >
                              <FaFacebookF size={14} />
                            </button>
                          )}
                          {userData.instagram && (
                            <button
                              onClick={() => handleSocialMediaClick(userData.instagram)}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                            >
                              <FaInstagram size={14} />
                            </button>
                          )}
                          {userData.linkedin && (
                            <button
                              onClick={() => handleSocialMediaClick(userData.linkedin)}
                              className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                            >
                              <FaLinkedinIn size={14} />
                            </button>
                          )}
                          {!userData.facebook && !userData.instagram && !userData.linkedin && (
                            <p className="text-gray-500 text-sm">No social media links provided</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccountDetailsModal;
