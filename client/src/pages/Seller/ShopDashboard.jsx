import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ShopDashboard = () => {
  const { user, axios, currency } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    totalOrders: 0,
    totalPayment: 0,
    totalItemsSold: 0,
    topProduct: null,
    topProducts: [],
    topCategory: null,
    topCategories: [],
  });

  const fetchDashboard = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`/api/orders/seller/${user._id}/dashboard`);
      if (data?.success) {
        setDashboard(data.dashboard || {});
      } else {
        toast.error(data?.message || "Failed to load dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-50 min-h-[95vh]">
      <h1 className="text-2xl font-semibold">Shop Dashboard</h1>
      <p className="text-gray-600 mt-1">Sales performance of your store</p>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading dashboard...</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-semibold mt-1">{dashboard.totalOrders || 0}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-gray-500 text-sm">Total Payment</p>
              <p className="text-2xl font-semibold mt-1 text-primary">
                {currency}
                {dashboard.totalPayment || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-gray-500 text-sm">Total Items Sold</p>
              <p className="text-2xl font-semibold mt-1">{dashboard.totalItemsSold || 0}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-medium">Top Selling Products</h2>
              {dashboard.topProducts?.length ? (
                <div className="mt-4 space-y-3">
                  {dashboard.topProducts.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between border-b border-gray-100 pb-2"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Revenue: {currency}{item.revenue}</p>
                      </div>
                      <p className="text-sm font-medium text-primary">{item.quantity} sold</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mt-3">No product sales yet.</p>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-medium">Top Selling Categories</h2>
              {dashboard.topCategories?.length ? (
                <div className="mt-4 space-y-3">
                  {dashboard.topCategories.map((item, index) => (
                    <div
                      key={`${item.category}-${index}`}
                      className="flex items-center justify-between border-b border-gray-100 pb-2"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.category}</p>
                        <p className="text-xs text-gray-500">Revenue: {currency}{item.revenue}</p>
                      </div>
                      <p className="text-sm font-medium text-primary">{item.quantity} sold</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mt-3">No category sales yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShopDashboard;
