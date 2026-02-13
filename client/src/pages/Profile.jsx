import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { Link, NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { MdForwardToInbox } from "react-icons/md";
import { IoIosLogOut, IoMdCart } from "react-icons/io";
import { MdPayment } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { FaAddressCard } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { AiOutlineCamera } from "react-icons/ai";
import { FaCartPlus } from "react-icons/fa";
import {useSelector} from "react-redux";
import axios from "axios";
function Profile() {
  const { showUserLogin } = useAppContext();
  // const user = useSelector();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [phone, setPhone] = useState("123-456-7890");
  const [zipCode, setZipCode] = useState("12345");
  const [address, setAddress] = useState("123 Main St, Anytown, USA");
  const[country, setCountry] = useState("USA");
  const sidebarLinks = [
    { name: "Profile", path: "/profile", icon: CgProfile, isImage: false },
    { name: "Orders", path: "/my-orders", icon: assets.order_icon, isImage: true },
    { name: "Refunds", path: "/refund", icon: RiSecurePaymentLine, isImage: false },
    {name:"Cart", path:"/cart", icon: FaCartPlus, isImage: false},
    { name: "Inbox", path: "/inbox", icon: MdForwardToInbox, isImage: false },
    {name:"Tracking Orders", path:"/tracking", icon: IoMdCart, isImage: false},
    { name: "Payment Methods", path: "/payment-methods", icon: MdPayment, isImage: false },
    { name: "Address", path: "/add-address", icon: FaAddressCard, isImage: false },
    { name: "Logout", path: "/", icon: IoIosLogOut, isImage: false,
      onClick: () => {logout();}},
  ];

  const logout = async () => {
    axios.get("/logout", {withCredentials: true}).then((response) => {
      if (response.data.success) {
        toast.success("Logged out successfully");
        window.location.href = "/";
      } else {
        toast.error("Logout failed");
      }
    }).catch((error) => {
      toast.error("An error occurred during logout");
    });
  };
  const submitHandler = (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
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
            <div className="flex flex-col items-center gap-8 mt-4">
                <div className="flex flex-col items-center">
                  <img src={assets.profile_icon} alt="user" className="w-[150px] h-[150px] rounded-full" />
                  <div className="flex items-center justify-center mt-2 cursor-pointer text-primary">
                    <AiOutlineCamera className="w-5 h-5" />
                    <p className="text-sm">Change Photo</p>
                  </div>
                </div>
                <div className="w-full flex justify-center">
                   <form className="flex flex-col gap-4 w-full max-w-2xl"
                   onSubmit={submitHandler}
                   >
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
                   </form>
                </div>
                
            </div>
            <Outlet />
        </div>
      </div>
    </>
  );
}
              
export default Profile;