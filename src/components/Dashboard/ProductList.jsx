import React from "react";
import { IoIosAdd, IoIosSearch } from "react-icons/io";

const ProductList = ({product}) => {
  return (
    <>
      <div className="mt-15 w-full flex justify-between items-center">
        <h3 className="font-lato font-semibold text-xl">ALL PRODUCTS</h3>
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search"
            className="font-lato border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-xs placeholder:text-gray-500 w-full"
          />
          <IoIosSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-10 min-h-[10.25rem]">
        <div className="bg-white rounded-xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat">
            <img src={product.url} alt="product-img" className="object-contain rounded-[50%]"/>
            <h3 className="font-lato font-semibold text-lg">{product.title}</h3>
            <span className="text-xs font-lato text-gray-500 font-semibold">{product.description}</span>
            <span className="font-bold text-sm font-lato mt-3">Price: {product.price}</span>
        </div>
        <div className="bg-white rounded-xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat">
            <img src={product.url} alt="product-img" className="object-contain rounded-[50%]" />
            <h3 className="font-lato font-semibold text-lg">{product.title}</h3>
            <span className="text-xs font-lato text-gray-500 font-semibold">{product.description}</span>
            <span className="font-bold text-sm font-lato mt-3">Price: {product.price}</span>
        </div>
        <div className="bg-white rounded-xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat cursor-pointer">
            <IoIosAdd className="text-gray-500 size-24"/>
            <span className="font-medium text-sm font-lato text-gray-500 mt-[-10px]">Add Item</span>
        </div>
      </div>
    </>
  );
};

export default ProductList;
