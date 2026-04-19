import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { MdForwardToInbox } from "react-icons/md";
import { IoIosLogOut, IoMdCart } from "react-icons/io";
import { MdPayment } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { FaAddressCard } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { AiOutlineCamera } from "react-icons/ai";
import { FaCartPlus } from "react-icons/fa";
import axios from "axios";

function Profile() {
  const { user, setUser, setIsSeller, navigate } = useAppContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const resolveProfileImage = (imagePath) => {
    if (!imagePath) return assets.profile_icon;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  useEffect(() => {
    const primaryAddress = user?.addresses?.[0] || {};
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(primaryAddress.phone || "");
    setZipCode(primaryAddress.zipcode ? String(primaryAddress.zipcode) : "");
    const mergedAddress = [primaryAddress.street, primaryAddress.city, primaryAddress.state]
      .filter(Boolean)
      .join(", ");
    setAddress(mergedAddress);
    setCountry(primaryAddress.country || "");
  }, [user]);

  const logout = async () => {
    try {
      const response = await axios.post("/api/auth/logout", {}, { withCredentials: true });
      if (response.data.success) {
        setUser(null);
        setIsSeller(false);
        toast.success("Logged out successfully");
        navigate("/");
      } else {
        toast.error(response.data.message || "Logout failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  };
  
  const sidebarLinks = [
    { name: "Profile", path: "/profile", icon: CgProfile, isImage: false },
    { name: "Orders", path: "/my-orders", icon: assets.order_icon, isImage: true },
    { name: "Refunds", path: "/refund", icon: RiSecurePaymentLine, isImage: false },
    { name: "Cart", path: "/cart", icon: FaCartPlus, isImage: false },
    { name: "Inbox", path: "/inbox", icon: MdForwardToInbox, isImage: false },
    { name: "Tracking Orders", path: "/tracking", icon: IoMdCart, isImage: false },
    { name: "Payment Methods", path: "/payment-methods", icon: MdPayment, isImage: false },
    { name: "Address", path: "/add-address", icon: FaAddressCard, isImage: false },
    { name: "Logout", path: "/", icon: IoIosLogOut, isImage: false,
      onClick: () => {logout();}},
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user?._id) {
      toast.error("Please log in again before uploading");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('userId', user._id);
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const { data } = await axios.post("/api/user/upload-profile-image", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        setUser(data.user || { ...user, profileImage: data.imageUrl });
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const [street = "", city = "", state = ""] = address
        .split(",")
        .map((part) => part.trim());

      const payload = {
        userId: user?._id,
        name: name.trim(),
        email: email.trim(),
        addresses: [
          {
            phone: phone.trim(),
            zipcode: zipCode ? Number(zipCode) : null,
            street,
            city,
            state,
            country: country.trim(),
          },
        ],
      };

      const { data } = await axios.put("/api/user/profile", payload, {
        withCredentials: true,
      });

      if (!data?.success) {
        toast.error(data?.message || "Failed to update profile");
        return;
      }

      setUser(data.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <>
      <div className="flex">
        <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col">
          {sidebarLinks.map((item) => {
            const IconComponent = item.isImage ? null : item.icon;
            
            return (
              <NavLink
                to={item.path}
                key={item.name}
                onClick={item.onClick}
                className={({ isActive }) => `flex items-center py-3 px-4 gap-3 
                            ${
                              isActive
                                ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                : "hover:bg-gray-100/90 border-white"
                            }`}
              >
                {item.isImage ? (
                  <img src={item.icon} alt="icon" className="w-7 h-7" />
                ) : (
                  <IconComponent className="w-7 h-7" />
                )}
                <p className="md:block hidden text-center">{item.name}</p>
              </NavLink>
            );
          })}
        </div>
        <div className="p-4 w-full">
          <form className="flex flex-col gap-4 w-full max-w-2xl" onSubmit={submitHandler}>
            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center gap-8 mt-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img 
                      src={resolveProfileImage(user?.profileImage)} 
                      alt="user" 
                      className="w-[150px] h-[150px] rounded-full object-cover" 
                    />
                    <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                      <AiOutlineCamera className="w-5 h-5 text-white" />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Zip Code</label>
                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary" />
                  </div>
                </div>
                
                <button type="submit" className="mt-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors w-fit">Save Changes</button>
              </div>
            </div>
          </form>
          <Outlet />
        </div>
      </div>
    </>
  );
}
  
export default Profile;