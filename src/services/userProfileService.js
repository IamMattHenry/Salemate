import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import firebaseApp from "../firebaseConfig";

const db = getFirestore(firebaseApp);

/**
 * Get user profile data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User profile not found");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update user profile data in Firestore
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, profileData);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update user social media links
 * @param {string} userId - User ID
 * @param {Object} socialLinks - Social media links (facebook, instagram, linkedin)
 * @returns {Promise<void>}
 */
export const updateSocialLinks = async (userId, socialLinks) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, socialLinks);
    return true;
  } catch (error) {
    console.error("Error updating social links:", error);
    throw error;
  }
};

/**
 * Update user personal information
 * @param {string} userId - User ID
 * @param {Object} personalInfo - Personal information (dateOfBirth, gender, address, phoneNumber)
 * @returns {Promise<void>}
 */
export const updatePersonalInfo = async (userId, personalInfo) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, personalInfo);
    return true;
  } catch (error) {
    console.error("Error updating personal information:", error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateSocialLinks,
  updatePersonalInfo
};
