import { useState } from "react";

const useNameModal = () => {
  const [inputNameModal, setNameModal] = useState(false); // Modal visibility state
  const [customerName, setCustomerName] = useState(""); // State for customer name
  const [studentId, setStudentId] = useState(""); // State for student ID

  // Toggle function for the modal
  const toggleModal = () => {
    setNameModal((prevState) => !prevState);
  };

  // Function specifically to show the modal
  const showNameModal = () => {
    setNameModal(true);
  };

  const handleSubmit = () => {
    console.log("Customer Name:", customerName);
    console.log("Student ID:", studentId);
    toggleModal(); // Close the modal after submission
  };

  return {
    inputNameModal,
    toggleModal,
    showNameModal,
    customerName,
    setCustomerName,
    studentId,
    setStudentId,
    handleSubmit,
  };
};

export const EnterNameModal = ({
  inputNameModal,
  toggleModal,
  customerName,
  setCustomerName,
  studentId,
  setStudentId,
  handleSubmit,
}) => {
  if (!inputNameModal) return null; // Don't render the modal if it's not visible

  return (
    <div className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50">
      <div className="bg-white w-[20rem] h-auto pb-5 rounded-xl shadow-lg font-lato">
        {/* Modal Header */}
        <div className="w-full rounded-t-xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
          <h3 className="font-bold text-lg">Confirm Order</h3>
          <button
            className="text-white hover:text-gray-200"
            onClick={toggleModal}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block font-lato text-sm mb-2">
              Please enter the customer's name:
            </label>
            <input
              type="text"
              placeholder="e.g., Juan Dela Cruz"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-lato text-sm mb-2">
              Please enter the student's ID:
            </label>
            <input
              type="text"
              placeholder="e.g., 23-2xxx"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-center">
          <button
            className="bg-[#0cd742] text-white px-6 py-2 rounded-lg hover:bg-green-600"
            onClick={handleSubmit}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default useNameModal;