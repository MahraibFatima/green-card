import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { dummyProducts } from "../assets/assets";
import axios from "axios";

export const AppContext = createContext();

const API_URL = "http://localhost:5000/api";

export const AppContextProvider = ({ children }) => {
  const currency = "$";
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isSeller, setIsSeller] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.role === 'seller';
    }
    return false;
  });
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const[searchQuery, setSearchQuery]=useState("");

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Fetch cart from backend when user logs in
      fetchCartFromBackend();
    } else {
      localStorage.removeItem('user');
      setCartItems({});
    }
  }, [user]);

  // Fetch cart from backend
  const fetchCartFromBackend = async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`${API_URL}/cart/${user._id}`);
      if (data.success) {
        const cartObj = {};
        data.cartItems.forEach(item => {
          cartObj[item.productId] = item.quantity;
        });
        setCartItems(cartObj);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const addToCart = async (productId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[productId]) {
      cartData[productId] += 1;
    } else {
      cartData[productId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to cart");
    
    // Sync with backend if user is logged in
    if (user?._id) {
      try {
        await axios.post(`${API_URL}/cart/add`, {
          userId: user._id,
          productId,
          quantity: 1
        });
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }
  };

  const updateCartItem = async (productId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[productId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
    
    // Sync with backend if user is logged in
    if (user?._id) {
      try {
        await axios.put(`${API_URL}/cart/${user._id}/${productId}`, {
          quantity
        });
      } catch (error) {
        console.error("Failed to update cart:", error);
      }
    }
  };

  const removeFromCart = async (productId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[productId]) {
      delete cartData[productId];
    }
    setCartItems(cartData);
    toast.success("Removed from cart");
    
    // Sync with backend if user is logged in
    if (user?._id) {
      try {
        await axios.delete(`${API_URL}/cart/${user._id}/${productId}`);
      } catch (error) {
        console.error("Failed to remove from cart:", error);
      }
    }
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
      const product = products.find((item) => item._id === key);
      if(product && cartItems[key]){
        count += product.offerPrice * cartItems[key];
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
    setCartItems,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    axios,
    API_URL
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