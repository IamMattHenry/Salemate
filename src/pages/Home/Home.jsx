import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  const navigate = useNavigate();

  const toSignIn = (e) => {
    e.preventDefault();
    navigate("/signin");
  };

  const fadeEffect = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      <section className="w-full overflow-hidden">
        <div className="heading-quote min-w-auto md:w-full flex justify-center mx-auto flex-col text-center mt-8 space-y-4 overflow-hidden">
          <div className="overflow-hidden">
            <motion.h1
              className="font-lato font-bold text-3xl md:text-[2.6rem] text-black"
              initial={{
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
              }}
            >
              Your Partner for Efficient{" "}
              <motion.span
                className="font-lato font-bold text-3xl md:text-[2.6rem]"
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.7,
                  type: "spring",
                  bounce: 0.8,
                  damping: 10,
                }}
              >
                Sales Management
              </motion.span>
            </motion.h1>
            <motion.p
              className="font-latrue tracking-wide md:text-xl"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 1.2,
                duration: 0.5,
              }}
            >
              A web-based platform for managing your sales wisely, easily, and
              quickly.
            </motion.p>
          </div>
          <motion.div
            className="start-btn bg-white border-2 border-yellowsm w-48 mx-auto flex items-center justify-center rounded-4xl hover:scale-105 transition shadow-xl mt-6 mb-2"
            initial={{
              translateX: -200,
              opacity: 0,
            }}
            animate={{
              translateX: 0,
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 1,
            }}
          >
            <button
              className="text-yellowsm font-latrue font-extrabold text-lg drop-shadow-xl py-2 cursor-pointer "
              onClick={toSignIn}
            >
              START NOW
            </button>
          </motion.div>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-4 space-x-8 mt-10 overflow-hidden">
          {/* First Image */}
          <motion.div
            className="flex flex-col items-center"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeEffect}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <div className="bg-yellowsm p-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.6)] h-auto w-[334px] max-w-full">
              <img
                src="./1.jpg"
                alt="Customer Relation Management"
                className="rounded-xl w-full h-[448px] object-cover brightness-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              />
            </div>
            <p className="text-center mt-3 font-lato font-bold text-2xl">
              Customer Relation Management
            </p>
            <p className="text-md font-latrue">
              Manages and compiles your loyal customers.
            </p>
          </motion.div>

          {/* Second Image */}
          <motion.div
            layout="position"
            className="flex flex-col items-center"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeEffect}
            transition={{ duration: 0.5, delay: 1.7 }}
          >
            <div className="bg-yellowsm p-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.6)] h-auto w-[334px] max-w-full">
              <img
                src="./3.jpg"
                alt="Analytics & Finance Report"
                className="rounded-xl w-full h-[448px] object-cover brightness-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              />
            </div>
            <p className="text-center mt-3 font-lato font-bold text-2xl">
              Analytics & Finance Report
            </p>
            <p className="text-md font-latrue">
              Easier way to generate sales and finance report.
            </p>
          </motion.div>

          {/* Third Image */}
          <motion.div
            layout="position"
            className="flex flex-col items-center"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeEffect}
            transition={{ duration: 0.5, delay: 2 }}
          >
            <div className="bg-yellowsm p-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.6)] h-auto w-[334px] max-w-full">
              <img
                src="./2.jpg"
                alt="Inventory Management"
                className="rounded-xl w-full h-[448px] object-cover brightness-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              />
            </div>
            <p className="text-center mt-3 font-lato font-bold text-2xl">
              Inventory Management
            </p>
            <p className="text-md font-latrue">
              Inventory of materials and corresponding information.
            </p>
          </motion.div>
        </div>
        <div className="h-20 bg-yellowsm/15 shadow-lg flex items-center justify-center w-full mt-10 overflow-hidden">
          <div className="flex space-x-1">
            <motion.h1
              className="font-lato text-4xl font-light"
              initial={{
                translateX: -300,
                opacity: 0.1,
              }}
              whileInView={{
                translateX: 0,
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
              }}
              viewport={{ once: true }}
            >
              Whatever your role is,
            </motion.h1>
            <div className="flex space-x-1">
              <motion.span
                className="font-lato text-4xl font-bold inline-block tracking-wider"
                initial={{ scale: 1.1, y: -30, opacity: 0 }}
                whileInView={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                viewport={{ once: true }}
              >
                we've{" "}
              </motion.span>
              <motion.span
                className="font-lato text-4xl font-bold inline-block tracking-wider"
                initial={{ scale: 1.2, y: -30, opacity: 0 }}
                whileInView={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.4,
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                viewport={{ once: true }}
              >
                got{" "}
              </motion.span>
              <motion.span
                className="font-lato text-4xl font-bold inline-block tracking-wider"
                initial={{ scale: 1.2, y: -30, opacity: 0 }}
                whileInView={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.6,
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                viewport={{ once: true }}
              >
                you{" "}
              </motion.span>
              <motion.span
                className="font-lato text-4xl font-bold inline-block tracking-wider"
                initial={{ scale: 1.2, y: -30, opacity: 0 }}
                whileInView={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 1.2,
                  type: "spring",
                  stiffness: 300,
                  damping: 10,
                  bounce: 0.8,
                }}
                viewport={{ once: true }}
              >
                covered{" "}
              </motion.span>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full px-4 md:px-10 xl:px-15 overflow-hidden">
        <div className="space-y-20">
          {/* First Section */}
          <motion.div
            layout="position"
            className="flex flex-col xl:flex-row items-center gap-10 pt-14"
            initial={{ translateX: -100, opacity: 0 }}
            whileInView={{ translateX: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
            viewport={{ once: true }}
          >
            <div className="bg-yellowsm rounded-3xl flex justify-center items-center w-full xl:w-1/2 h-[18rem]">
              <img
                src="/dashboard_2.png"
                alt=""
                className="h-auto w-[95%] rounded-3xl object-contain"
              />
            </div>
            <div className="flex flex-col justify-center items-center w-full xl:w-1/2 text-center space-y-4">
              <h1 className="font-bold font-lato text-3xl xl:text-4xl">
                Easily manages the <br /> purchasing process
              </h1>
              <h1 className="font-normal font-latrue text-xl xl:text-2xl">
                By just using the dashboard for <br /> transactions and
                purchasing process, <br /> you can monitor orders, sales, and{" "}
                <br />
                analytics report of your monthly sale, <br /> and track your
                customers.
              </h1>
            </div>
          </motion.div>

          {/* Second Section */}
          <motion.div
            layout="position"
            className="flex flex-col-reverse xl:flex-row items-center gap-10"
            initial={{ translateX: 100, opacity: 0 }}
            whileInView={{ translateX: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col justify-center items-center w-full xl:w-1/2 text-center space-y-4">
              <h1 className="font-bold font-lato text-3xl xl:text-4xl">
                Monitor real time orders
              </h1>
              <h1 className="font-normal font-latrue text-xl xl:text-2xl">
                Easily track, record, and monitor customer <br /> orders with
                the Order History Dashboard. <br /> Stay updated on order status
                and ensure <br />
                successful deliveries every time.
              </h1>
            </div>
            <div className="bg-yellowsm rounded-3xl flex justify-center items-center w-full xl:w-1/2 h-[18rem]">
              <img
                src="/orderhisto_2.png"
                alt=""
                className="h-auto w-[95%] rounded-3xl object-contain"
              />
            </div>
          </motion.div>

          {/* Third Section */}
          <motion.div
            layout="position"
            className="flex flex-col xl:flex-row items-center gap-10"
            initial={{ translateX: -100, opacity: 0 }}
            whileInView={{ translateX: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
            viewport={{ once: true }}
          >
            <div className="bg-yellowsm rounded-3xl flex justify-center items-center w-full xl:w-1/2 h-[18rem]">
              <img
                src="/analytic_2.png"
                alt=""
                className="h-auto w-[95%] rounded-3xl object-contain"
              />
            </div>
            <div className="flex flex-col justify-center items-center w-full xl:w-1/2 text-center space-y-4">
              <h1 className="font-bold font-lato text-3xl xl:text-4xl">
                Provides necessary <br />
                business information
              </h1>
              <h1 className="font-normal font-latrue text-xl xl:text-2xl">
                Analytic report page summarizes the overall <br /> performance
                of your business and see the <br /> effectiveness of your
                business operation.
              </h1>
            </div>
          </motion.div>

          {/* Fourth Section */}
          <motion.div
            layout="position"
            className="flex flex-col-reverse xl:flex-row items-center gap-10"
            initial={{ translateX: 100, opacity: 0 }}
            whileInView={{ translateX: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col justify-center items-center w-full xl:w-1/2 text-center space-y-4">
              <h1 className="font-bold font-lato text-3xl xl:text-4xl">
                Tracking the <br /> frequency of orders
              </h1>
              <h1 className="font-normal font-latrue text-xl xl:text-2xl">
                With Salemate, you can track your customer <br /> This system
                will allow you to know if your customers <br /> are active or
                not actively ordering, and even <br /> the overall number of
                orders, average amount
                <br /> of their purchase, last date ordered, and <br /> further
                purchasing information.
              </h1>
            </div>
            <div className="bg-yellowsm rounded-3xl flex justify-center items-center w-full xl:w-1/2 h-[18rem]">
              <img
                src="/customer_@.png"
                alt=""
                className="h-auto w-[95%] rounded-3xl object-contain"
              />
            </div>
          </motion.div>

          {/* Fifth Section */}
          <motion.div
            layout="position"
            className="flex flex-col xl:flex-row items-center gap-10"
            initial={{ translateX: -100, opacity: 0 }}
            whileInView={{ translateX: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
            viewport={{ once: true }}
          >
            <div className="bg-yellowsm rounded-3xl flex justify-center items-center w-full xl:w-1/2 h-[18rem]">
              <img
                src="/inventory_2.png"
                alt=""
                className="h-auto w-[95%] rounded-3xl object-contain"
              />
            </div>
            <div className="flex flex-col justify-center items-center w-full xl:w-1/2 text-center space-y-4">
              <h1 className="font-bold font-lato text-3xl xl:text-4xl">
                Manage inventory <br /> seamlessly
              </h1>
              <h1 className="font-normal font-latrue text-xl xl:text-2xl">
                Stay informed on stock levels, monitor item <br /> availability,
                and make data-driven decisions <br /> to optimize your inventory
                management.
              </h1>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Home;
