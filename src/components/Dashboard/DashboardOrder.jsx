import React from "react";
import { useState } from "react";
import { IoMdTime, IoMdTrash } from "react-icons/io";
import { IoCalendar, IoPencil } from "react-icons/io5";
import { MdCancel } from "react-icons/md";

const dateToday = new Date();
const timeToday = dateToday.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormat = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const formattedDate = dateToday.toLocaleDateString("en-US", dateFormat);

const DashboardOrder = ({ product }) => {
  const [orderNumber, setOrderNumber] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const increaseQuantity = () => {
    if (quantity >= 1) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <div className="bg-white shadow-feat px-2 pt-2 h-full rounded-tr-xl rounded-br-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-lato font-semibold text-lg">
          Order {orderNumber}:{" "}
        </h3>
        <div className="font-lato text-xs font-semibold space-x-2 flex">
          <span className="flex gap-1">
            <IoMdTime />
            {timeToday}{" "}
          </span>
          <span className="flex gap-1">
            <IoCalendar />
            {formattedDate}
          </span>
        </div>
      </div>
      <div className="space-y-1 mt-5 mx-3">
        <h4 className="font-lato font-semibold text-sm">Mode of Payment:</h4>
        <div className="font-semibold font-lato text-[.87rem] flex items-center justify-between">
          <div className="space-x-3">
            <button className="border rounded-xl py-0.5 px-6 cursor-pointer">
              Cash
            </button>
            <button className="border rounded-xl py-0.5 px-5 cursor-pointer">
              Online
            </button>
          </div>
          <div className="text-red-600 text-xl cursor-pointer">
            <IoMdTrash />
          </div>
        </div>
      </div>
      <div className="h-[17.3rem] w-full mt-5 flex flex-col space-y-5 overflow-y-auto product-scroll">
        {/* Nag seed lang ako ng data para mapakita itsura ninya pag may data na. Gagawin ko ring dynamic 'to soon*/}
        <div className="relative grid grid-cols-[30%_1fr_35%] gap-2 items-center">
          <div>
            <img
              src={product.url}
              alt="katsu"
              className="size-20 md:h-auto md:w-full rounded-[50%]"
            />
          </div>
          <div className="flex flex-col justify-start">
            <span className="font-semibold text-sm">{product.title}</span>
            <span className="text-sm text-gray-500 font-lato">
              {product.description}
            </span>
            <span className="text-xs">&#8369; {product.price}</span>
          </div>
          <div className=" font-lato font-bold text-sm text-center flex flex-col justify-between h-full">
            <div className="text-sm flex justify-end space-x-1">
              <IoPencil />
              <MdCancel className="text-red-600" />
            </div>
            <div className="space-x-2 flex items-center justify-center">
              <button
                onClick={decreaseQuantity}
                className="cursor-pointer text-xl"
              >
                -
              </button>
              <input
                type="text"
                placeholder={quantity}
                className="border-[0.5px] border-gray-500 w-[50%] text-center rounded-xl"
              />
              <button
                onClick={increaseQuantity}
                className="cursor-pointer text-xl"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-[30%_1fr_35%] gap-2 items-center">
          <div>
            <img
              src={product.url}
              alt="katsu"
              className="size-20 md:h-auto md:w-full rounded-[50%]"
            />
          </div>
          <div className="flex flex-col justify-start">
            <span className="font-semibold text-sm">{product.title}</span>
            <span className="text-sm text-gray-500 font-lato">
              {product.description}
            </span>
            <span className="text-xs">&#8369; {product.price}</span>
          </div>
          <div className=" font-lato font-bold text-sm text-center flex flex-col justify-between h-full">
            <div className="text-sm flex justify-end space-x-1">
              <IoPencil />
              <MdCancel className="text-red-600" />
            </div>
            <div className="space-x-2 flex items-center justify-center">
              <button
                onClick={decreaseQuantity}
                className="cursor-pointer text-xl"
              >
                -
              </button>
              <input
                type="text"
                placeholder={quantity}
                className="border-[0.5px] border-gray-500 w-[50%] text-center rounded-xl"
              />
              <button
                onClick={increaseQuantity}
                className="cursor-pointer text-xl"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-[30%_1fr_35%] gap-2 items-center">
          <div>
            <img
              src={product.url}
              alt="katsu"
              className="size-20 md:h-auto md:w-full rounded-[50%]"
            />
          </div>
          <div className="flex flex-col justify-start">
            <span className="font-semibold text-sm">{product.title}</span>
            <span className="text-sm text-gray-500 font-lato">
              {product.description}
            </span>
            <span className="text-xs">&#8369; {product.price}</span>
          </div>
          <div className=" font-lato font-bold text-sm text-center flex flex-col justify-between h-full">
            <div className="text-sm flex justify-end space-x-1">
              <IoPencil />
              <MdCancel className="text-red-600" />
            </div>
            <div className="space-x-2 flex items-center justify-center">
              <button
                onClick={decreaseQuantity}
                className="cursor-pointer text-xl"
              >
                -
              </button>
              <input
                type="text"
                placeholder={quantity}
                className="border-[0.5px] border-gray-500 w-[50%] text-center rounded-xl"
              />
              <button
                onClick={increaseQuantity}
                className="cursor-pointer text-xl"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-rows-2 bg-gray-300/30 h-[4.5rem] -mx-3 py-2 pl-3 pr-5 gap-2 mt-3">
        <div className="flex justify-between">
          <span className="font-semibold font-lato text-[0.9rem]">
            Number of Products:
          </span>
          <span className="font-medium font-lato text-[0.9rem]">3x</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold font-lato text-[0.9rem]">
            Subtotal:
          </span>
          <span className="font-medium font-lato text-[0.9rem]">&#8369; 1050</span>
        </div>
      </div>
      <div className="h-[3.3rem] items-center flex justify-end">
        <button className="text-sm font-lato font-bold bg-[#0cd742] rounded-3xl border-[0.5px] border-green-950 py-1 text-white px-3">Checkout</button>
      </div>
      {/* TO-DO: Add item, Customer Name, Order Receipt */}
    </div>
  );
};

export default DashboardOrder;
