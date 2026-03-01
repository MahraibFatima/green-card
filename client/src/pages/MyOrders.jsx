import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { dummyOrders } from "../assets/assets";
import { assets } from "../assets/assets";

function MyOrders() {
  const [MyOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency, axios, user, navigate } = useAppContext();

  const fetchMyOrders = async () => {
    setLoading(true);
    if (!user?._id) {
      setMyOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:5000/api/orders/${user._id}`);
      if (data.success) {
        setMyOrders(data.orders);
      } else {
        setMyOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setMyOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
      fetchMyOrders();
  }, [user]);

  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500 text-lg">Loading your orders...</p>
        </div>
      ) : MyOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 max-w-4xl">
          <img src={assets.empty_cart} alt="No orders" className="w-32 h-32 mb-6 opacity-50" />
          <p className="text-gray-500 text-xl font-medium mb-2">No Orders Yet!</p>
          <p className="text-gray-400 text-center mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
        </div>
      ) : (
        MyOrders.map((order, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
          >
          <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col">
            <span>OrderId: {order._id}</span>
            <span>Payment: {order.paymentType}</span>
            <span>
              Totol Amount: {currency}
              {order.amount}
            </span>
          </p>
          {order.items.map((item, index) => (
            <div
              key={index}
              className={`relative bg-white text-gray-500/70 ${
                order.items.length !== index + 1 && "border-b"
              } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
            >
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <img
                    src={item.product.image[0]}
                    alt=""
                    className="w-16 h-16"
                  />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium tex-gray-800">
                    {item.product.name}
                  </h2>
                  <p>Category: {item.product.category}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                <p>Quantity: {item.quantity || "1"}</p>
                <p>Status: {order.status}</p>
                <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
              </div>
              <p className="text-primary text-lg font-medium">
                Amount: {currency}
                {item.product.offerPrice * item.quantity}
              </p>
            </div>
          ))}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-300">
            <button
              onClick={() => {
                navigate(`/tracking/${order._id}`);
                scrollTo(0, 0);
              }}
              className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dull transition"
            >
              Track Order
            </button>
          </div>
          </div>
        ))
        )}
    </div>
  );
}
export default MyOrders;
