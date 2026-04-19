import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

function Orders() {
  const { currency, user, axios } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    if (!user?._id) return;

    try {
      const { data } = await axios.get(`/api/orders/seller/${user._id}`);
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/api/orders/${orderId}/status`, { status });
      if (data.success) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return (
    <div className="md:p-10 p-4 space-y-4">
      <h2 className="text-lg font-medium">Orders List</h2>

      {orders.length === 0 && (
        <p className="text-gray-500">No orders for your products yet.</p>
      )}

      {orders.map((order) => (
        <div
          key={order._id}
          className="flex flex-col md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300"
        >
          <div className="flex gap-4 max-w-80">
            <img
              className="w-12 h-12 object-cover"
              src={assets.box_icon}
              alt="boxIcon"
            />
            <div>
              {order.items?.map((item, index) => (
                <p key={`${order._id}-${index}`} className="font-medium">
                  {item.product?.name || "Product"}{" "}
                  <span className="text-primary">x {item.quantity}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="text-sm md:text-base text-black/60">
            <p className="text-black/80">{order.customer?.name || "Customer"}</p>
            <p>{order.customer?.email || "-"}</p>
            <p>
              {order.address?.street}, {order.address?.city}
            </p>
            <p>
              {order.address?.state}, {order.address?.zipCode || order.address?.zipcode}, {order.address?.country}
            </p>
            <p>{order.customer?.phone || order.address?.phone || "-"}</p>
          </div>

          <p className="font-medium text-lg my-auto">
            {currency}
            {order.sellerAmount || order.amount}
          </p>

          <div className="flex flex-col text-sm md:text-base text-black/60">
            <p>Method: {order.paymentType}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="capitalize">
              Status: {(order.status || "placed").replaceAll("_", " ")}
            </p>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              className="mt-2 border border-gray-300 rounded px-2 py-1"
            >
              <option value="placed">Placed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;
