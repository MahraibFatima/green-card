import React from "react";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import Login from "./components/Login";
import { useAppContext } from "./context/AppContext";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import SellerLogin from "./components/seller/SellerLogin";
import SellerLayout from "./pages/Seller/SellerLayout";
import AddProduct from "./pages/Seller/AddProduct";
import Orders from "./pages/Seller/Orders";
import ProductList from "./pages/Seller/ProductList";
import Loading from "./components/Loading";
import Profile from "./pages/Profile";
import Faqs from "./components/Faqs";
import Refund from "./pages/Refund";
import Tracking from "./pages/Tracking";
import PaymentMethods from "./pages/PaymentMethods";
import { ProtectedRoute, PublicRoute, SellerProtectedRoute } from "./protectedRoutes";

function App() {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin, isSeller } = useAppContext();

  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}

      <Toaster />
      <div
        className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"} `}
      >
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/tracking" element={<ProtectedRoute element={<Tracking />} />} />
          <Route path="/refund" element={<ProtectedRoute element={<Refund />} />} />
          <Route path="/add-address" element={<ProtectedRoute element={<AddAddress />} />} />
          <Route path="/my-orders" element={<ProtectedRoute element={<MyOrders />} />} />
          <Route path="/payment-methods" element={<ProtectedRoute element={<PaymentMethods />} />} />
          <Route path="/loader" element={<Loading />} />
          <Route path="/seller" element={<SellerProtectedRoute element={isSeller ? <SellerLayout /> : <SellerLogin />} isSeller={isSeller} />}>
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  );
}

export default App;
