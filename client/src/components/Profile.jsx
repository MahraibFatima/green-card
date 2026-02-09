import React from "react";
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
function Profile() {
  const { setIsSeller } = useAppContext();

  const sidebarLinks = [
    { name: "Profile", path: "/profile", icon: CgProfile, isImage: false },
    { name: "Orders", path: "/profile/orders", icon: assets.order_icon, isImage: true },
    { name: "Refunds", path: "/profile/refunds", icon: RiSecurePaymentLine, isImage: false },
    { name: "Inbox", path: "/profile/inbox", icon: MdForwardToInbox, isImage: false },
    {name:"Tracking Orders", path:"/profile/tracking", icon: IoMdCart, isImage: false},
    { name: "Payment Methods", path: "/profile/payment-methods", icon: MdPayment, isImage: false },
    { name: "Address", path: "/profile/address", icon: FaAddressCard, isImage: false },
    { name: "Logout", path: "/profile/logout", icon: IoIosLogOut, isImage: false,
      onClick: () => {toast.success("Logged out successfully");logout();}},
  ];

  const logout = async () => {
    setIsSeller(false);
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
        <Outlet />
      </div>
    </>
  );
}
export default Profile;