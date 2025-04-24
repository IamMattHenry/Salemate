import React, { useEffect, useState } from "react";
import { BsPersonCircle } from "react-icons/bs";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import firebaseApp from "../../firebaseConfig"; 

const DashboardHeader = () => {
  const [lastName, setLastName] = useState(""); // State to store the last name
  const [department, setDepartment] = useState(""); // State to store the department
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation(); 
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setLastName(userDoc.data().lastName); // Fetch the last name
            setDepartment(userDoc.data().department); // Fetch the department
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to fetch user data.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("No user is currently logged in.");
        setLoading(false);
      }
    });

    return () => unsubscribe(); 
  }, [auth, db]);

  const dateToday = new Date();
  const dateFormat = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = dateToday.toLocaleDateString("en-US", dateFormat);

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes("inventory")) return "Inventory";
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("orders")) return "Order History"; 
    if (path.includes("analytics")) return "Analytic Report"; 
    if (path.includes("customer")) return "Customer";
    return "Welcome";
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="bg-whitesm/50 w-full pt-2">
      <div className="w-full flex justify-between items-center pr-5 pl-8.5 py-2">
        <h3 className="font-lato font-bold text-4xl">{getHeaderTitle()}</h3>
        <div className="flex items-center pr-3 py-1">
          <h4 className="font-lato border-r-2 py-1 pr-3">{formattedDate}</h4>

          <div className="flex items-center">
            <div className="flex flex-col text-center mx-2 leading-none">
              <h3 className="font-semibold font-lato text-xl p-0 mb-[-7px]">
                {lastName} {/* Display the last name */}
              </h3>
              <span className="font-lato text-gray-400 text-sm">
                {department} {/* Display the department */}
              </span>
            </div>
            <div>
              <BsPersonCircle className="size-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
