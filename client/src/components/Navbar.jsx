import { NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    searchQuery,
    setSearchQuery,
    getCartCount,
  } = useAppContext();

  const logout = async () => {
    setUser(null);
    navigate("/");
    setOpen(false);
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
      <NavLink to="/" onClick={() => setOpen(false)}>
        <img className="h-9" src={assets.logo} alt="Logo" />
      </NavLink>

      <div className="hidden sm:flex items-center gap-8">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">All Products</NavLink>
        <NavLink to="/faqs">FAQs</NavLink>
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <img src={assets.nav_cart_icon} alt="cart" className="w-6 h-6" />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
            {getCartCount()}
          </button>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary transition text-white rounded-full"
            >
              Login
            </button>
          ) : (
            <div className="relative group cursor-pointer">
              <img
                src={assets.profile_icon}
                className="w-10"
                alt="profile icon" 
                onClick={() =>{navigate("/profile"); setOpen(false)}}
              />
            </div>
          )}
        </div>

        <NavLink to="/seller" className="text-sm cursor-pointer px-6 py-2 bg-primary hover:bg-primary transition text-white rounded-sm">
          Become a Seller
        </NavLink>
      </div>

      <div className="flex items-center gap-4 sm:hidden">
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <img src={assets.nav_cart_icon} alt="cart" className="w-6 h-6" />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
            {getCartCount()}
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="flex items-center justify-center w-8 h-8"
        >
          <img
            src={open ? assets.close_icon : assets.menu_icon}
            alt="menu"
            className="w-6 h-6"
          />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-md py-4 flex flex-col items-start gap-3 px-5 text-sm z-50 border-t border-gray-200">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className="w-full py-2 hover:text-primary"
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setOpen(false)}
              className="w-full py-2 hover:text-primary"
            >
              All Products
            </NavLink>
            <NavLink
              to="/faqs"
              onClick={() => setOpen(false)}
              className="w-full py-2 hover:text-primary"
            >
              FAQs
            </NavLink>
            {user && (
              <NavLink
                to="/my-orders"
                onClick={() => setOpen(false)}
                className="w-full py-2 hover:text-primary"
              >
                My Orders
              </NavLink>
            )}
            <NavLink
              to="/seller"
              onClick={() => setOpen(false)}
              className="w-full py-2 hover:text-primary"
            >
              Become a Seller
            </NavLink>
            <div className="w-full pt-2 border-t border-gray-100 mt-2">
              {!user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowUserLogin(true);
                  }}
                  className="w-full cursor-pointer px-8 py-2.5 bg-primary hover:bg-primary-dark transition text-white rounded-full"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="w-full cursor-pointer px-8 py-2.5 bg-gray-800 hover:bg-gray-900 transition text-white rounded-full text-sm"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;