import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const cardTypeImages = {
  visa: "https://imgs.search.brave.com/4FXHu4DmRUEmmq5VaAbmPaAIn9PRDla-8cYTohgJ6as/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9icmFu/ZGxvZ29zLm5ldC93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxMy8w/Ni92aXNhLWluYy12/ZWN0b3ItbG9nby5w/bmc",
  mastercard:
    "https://imgs.search.brave.com/1-dQWMOA-NZ4HyYdf33LrQwjmntj1I4FsOZ5Pexi6_g/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/ZnJlZXBuZ2xvZ29z/LmNvbS91cGxvYWRz/L21hc3RlcmNhcmQt/cG5nL21hc3RlcmNh/cmQtbWFyY3VzLXNh/bXVlbHNzb24tZ3Jv/dXAtMi5wbmc",
  amex: "https://imgs.search.brave.com/sYkCPjQ6VBB4VxRjJL_Cd1dM7AQZqXxWLGhz_r4Msx8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9sb2dv/c3BuZy5vcmcvZG93/bmxvYWQvYW1lcmlj/YW4tZXhwcmVzcy9s/b2dvLWFtZXJpY2Fu/LWV4cHJlc3MtMTAy/NC5wbmc",
};

const PaymentCard = ({ payment, onDelete, onSetDefault }) => {
  const cardImage = cardTypeImages[payment.cardType.toLowerCase()] || "";

  return (
    <div
      className={`border rounded-lg p-4 flex items-center justify-between ${
        payment.isDefault
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300"
      } transition`}
    >
      <div className="flex items-center gap-4">
        {cardImage && (
          <img
            src={cardImage}
            alt={payment.cardType}
            className="w-12 h-8 object-contain"
          />
        )}
        <div>
          <p className="font-medium text-gray-900">
            {payment.cardType} **** {payment.cardNumber}
          </p>
          <p className="text-sm text-gray-600">{payment.cardHolderName}</p>
          <p className="text-sm text-gray-500">
            Expires {payment.expiryMonth}/{payment.expiryYear}
          </p>
          {payment.isDefault && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded mt-1 inline-block">
              Default
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {!payment.isDefault && (
          <button
            onClick={() => onSetDefault(payment._id)}
            className="text-primary hover:text-primary-dull text-sm px-3 py-1 border border-primary rounded"
          >
            Set Default
          </button>
        )}
        <button
          onClick={() => onDelete(payment._id)}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

const PaymentMethods = () => {
  const { axios, user, navigate, API_URL } = useAppContext();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    cardType: "visa",
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    isDefault: false,
  });

  const fetchPaymentMethods = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/payment/${user._id}`);
      if (data.success) {
        setPaymentMethods(data.paymentMethods);
        setShowForm(data.paymentMethods.length === 0);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.cardHolderName || !formData.cardNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.cardNumber.length < 13 || formData.cardNumber.length > 19) {
      toast.error("Invalid card number");
      return;
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      toast.error("Please enter expiry date");
      return;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      toast.error("Invalid CVV");
      return;
    }

    try {
      // Store only last 4 digits for security
      const last4 = formData.cardNumber.slice(-4);

      const { data } = await axios.post(`${API_URL}/payment/add`, {
        userId: user._id,
        paymentMethod: {
          cardType: formData.cardType,
          cardHolderName: formData.cardHolderName,
          cardNumber: last4,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          isDefault: formData.isDefault,
        },
      });

      if (data.success) {
        toast.success("Payment method added successfully");
        setFormData({
          cardType: "visa",
          cardHolderName: "",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cvv: "",
          isDefault: false,
        });
        setShowForm(false);
        fetchPaymentMethods();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add payment method"
      );
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm("Are you sure you want to remove this payment method?")) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${API_URL}/payment/${user._id}/${paymentId}`
      );
      if (data.success) {
        toast.success("Payment method removed successfully");
        fetchPaymentMethods();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove payment method"
      );
    }
  };

  const handleSetDefault = async (paymentId) => {
    try {
      const payment = paymentMethods.find((pm) => pm._id === paymentId);
      const { data } = await axios.put(
        `${API_URL}/payment/${user._id}/${paymentId}`,
        {
          paymentMethod: { ...payment, isDefault: true },
        }
      );
      if (data.success) {
        toast.success("Default payment method updated");
        fetchPaymentMethods();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update payment method"
      );
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchPaymentMethods();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="py-8 w-full max-w-4xl flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-8 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        {!showForm && paymentMethods.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition"
          >
            + Add Payment Method
          </button>
        )}
      </div>

      {/* Display existing payment methods */}
      {!showForm && paymentMethods.length > 0 && (
        <div className="space-y-4">
          {paymentMethods.map((payment) => (
            <PaymentCard
              key={payment._id}
              payment={payment}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* No payment methods found */}
      {!showForm && paymentMethods.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <p className="text-lg text-gray-600 mb-6">No payment methods found</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition"
          >
            Add Your First Payment Method
          </button>
        </div>
      )}

      {/* Add payment method form */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Payment Method</h2>
            {paymentMethods.length > 0 && (
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Type
              </label>
              <select
                name="cardType"
                value={formData.cardType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary transition"
                required
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Holder Name *
              </label>
              <input
                type="text"
                name="cardHolderName"
                value={formData.cardHolderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary transition"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Month *
                </label>
                <select
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary transition"
                  required
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = String(i + 1).padStart(2, "0");
                    return (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Year *
                </label>
                <select
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary transition"
                  required
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = String(new Date().getFullYear() + i).slice(-2);
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary transition"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                id="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                Set as default payment method
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dull transition font-medium"
            >
              Add Payment Method
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
