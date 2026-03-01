import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

function SellerLogin() {
  const { isSeller, setIsSeller, navigate, axios, API_URL, setUser } = useAppContext();
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      setIsLoading(true);

      if (state === "login") {
        // Seller Login
        if (!email || !password) {
          toast.error("Please fill in all fields");
          return;
        }

        const response = await axios.post(`${API_URL}/auth/seller/login`, {
          email,
          password,
        });

        if (response.data.seller) {
          setUser(response.data.seller);
          setIsSeller(true);
          toast.success("Login successful");
          setEmail("");
          setPassword("");
        } else {
          toast.error(response.data.message || "Login failed");
        }
      } else {
        // Seller Signup
        if (!name || !email || !password || !shopName) {
          toast.error("Please fill in all required fields");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }

        const response = await axios.post(`${API_URL}/auth/seller/register`, {
          name,
          email,
          password,
          shopName,
          shopPhone,
        });

        if (response.data.seller) {
          toast.success(response.data.message);
          setState("login");
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setShopName("");
          setShopPhone("");
        } else {
          toast.error(response.data.message || "Signup failed");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Operation failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-screen flex items-center text-sm text-gray-600 py-10"
    >
      <div className="flex flex-col gap-4 m-auto items-start p-8 min-w-80 sm:min-w-96 rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto w-full text-center">
          <span className="text-primary">Seller</span>
          {state === "login" ? " Login" : " Sign Up"}
        </p>

        {state === "register" && (
          <>
            <div className="w-full">
              <p className="mb-1 font-medium">Full Name *</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Enter your full name"
                className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div className="w-full">
              <p className="mb-1 font-medium">Shop Name *</p>
              <input
                onChange={(e) => setShopName(e.target.value)}
                value={shopName}
                type="text"
                placeholder="Enter your shop name"
                className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div className="w-full">
              <p className="mb-1 font-medium">Shop Phone</p>
              <input
                onChange={(e) => setShopPhone(e.target.value)}
                value={shopPhone}
                type="tel"
                placeholder="Enter your shop phone number"
                className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <div className="w-full">
          <p className="mb-1 font-medium">Email *</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Enter your email"
            className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
            disabled={isLoading}
          />
        </div>

        <div className="w-full">
          <p className="mb-1 font-medium">Password *</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder={state === "register" ? "Min 6 characters" : "Enter your password"}
            className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
            disabled={isLoading}
          />
        </div>

        {state === "register" && (
          <div className="w-full">
            <p className="mb-1 font-medium">Confirm Password *</p>
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              type="password"
              placeholder="Confirm your password"
              className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              required
              disabled={isLoading}
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 font-medium hover:bg-opacity-90 transition-all"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : state === "login" ? "Login" : "Sign Up"}
        </button>

        <div className="mt-2 w-full text-center text-sm">
          {state === "register" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-primary cursor-pointer font-semibold hover:underline"
              >
                Click here
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-primary cursor-pointer font-semibold hover:underline"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

export default SellerLogin;
