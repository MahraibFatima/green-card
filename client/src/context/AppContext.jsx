import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { dummyProducts } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = "$";
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const[searchQuery, setSearchQuery]=useState("");

  const addToCart = (productId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[productId]) {
      cartData[productId] += 1;
    } else {
      cartData[productId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to cart");
  };

  const updateCartItem = (productId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[productId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
  };

  const removeFromCart = (productId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[productId]) {
      cartData[productId] -= 1;
      if (cartData[productId] === 0) {
        delete cartData[productId];
      }
    }
    setCartItems(cartData);
    toast.success("Removed from cart");
  };

const fetchProducts = async() => {
        setProducts(dummyProducts);
    }
const getCartCount = () => {
    let count = 0;
    for (let key in cartItems) {
      count += cartItems[key];
    }
    return count;
  };

const getCartAmount = () => {
    let count = 0;
    for (const key in cartItems) {
      count += products.find((item) => item._id === key);
      if(cartItems[key]){
        count = count * cartItems[key];
      }
    }
    return Math.floor(count*100)/100;
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    setProducts,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }

  return context;
};