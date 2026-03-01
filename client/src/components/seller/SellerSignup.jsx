import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function SellerSignup() {
  const { navigate, axios, API_URL } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    shopPhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      setIsLoading(true);

      // Validation
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      if (!formData.shopName) {
        toast.error("Shop name is required");
        return;
      }

      const response = await axios.post(`${API_URL}/auth/seller/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        shopName: formData.shopName,
        shopPhone: formData.shopPhone,
      });

      if (response.data.seller) {
        toast.success("Signup successful! Please verify your email to login");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          shopName: "",
          shopPhone: "",
        });
        // Redirect to login after a delay
        setTimeout(() => {
          navigate("/seller");
        }, 2000);
      } else {
        toast.error(response.data.message || "Signup failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Signup failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-screen flex items-center text-sm text-gray-600 py-10"
    >
      <div className="flex flex-col gap-4 m-auto items-start p-8 min-w-80 sm:min-w-96 rounded-lg shadow-xl border border-gray-200">
        <p className="text-2xl font-medium m-auto w-full text-center">
          <span className="text-primary">Seller</span> Signup
        </p>

        <div className="w-full">
          <p className="mb-1">Full Name *</p>
          <input
            onChange={handleChange}
            value={formData.name}
            name="name"
            type="text"
            placeholder="Enter your full name"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div className="w-full">
          <p className="mb-1">Email *</p>
          <input
            onChange={handleChange}
            value={formData.email}
            name="email"
            type="email"
            placeholder="Enter your email"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div className="w-full">
          <p className="mb-1">Shop Name *</p>
          <input
            onChange={handleChange}
            value={formData.shopName}
            name="shopName"
            type="text"
            placeholder="Enter your shop name"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div className="w-full">
          <p className="mb-1">Shop Phone</p>
          <input
            onChange={handleChange}
            value={formData.shopPhone}
            name="shopPhone"
            type="tel"
            placeholder="Enter your shop phone number"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            disabled={isLoading}
          />
        </div>

        <div className="w-full">
          <p className="mb-1">Password *</p>
          <input
            onChange={handleChange}
            value={formData.password}
            name="password"
            type="password"
            placeholder="Enter password (min 6 characters)"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div className="w-full">
          <p className="mb-1">Confirm Password *</p>
          <input
            onChange={handleChange}
            value={formData.confirmPassword}
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center w-full text-sm">
          Already have an account?{" "}
          <Link to="/seller" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}

export default SellerSignup;
