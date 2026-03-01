import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    required
  />
);

const AddressCard = ({ address, onDelete }) => (
  <div className="border border-gray-300 rounded-lg p-4 mb-4 hover:border-primary transition">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-700 mb-2">
          {address.firstName} {address.lastName}
        </h3>
        <p className="text-sm text-gray-600">{address.street}</p>
        <p className="text-sm text-gray-600">
          {address.city}, {address.state} {address.zipcode}
        </p>
        <p className="text-sm text-gray-600">{address.country}</p>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-medium">Phone:</span> {address.phone}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {address.email}
        </p>
      </div>
      <button
        onClick={() => onDelete(address._id)}
        className="text-red-500 hover:text-red-700 ml-4"
        title="Delete address"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
);

export default function AddAddress() {
  const { axios, user, navigate, API_URL } = useAppContext();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const fetchAddresses = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/address/${user._id}`);
      if (data.success) {
        setAddresses(data.addresses);
        setShowForm(data.addresses.length === 0);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error("Please login to save an address");
      navigate("/login");
      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "street",
      "city",
      "state",
      "zipcode",
      "country",
      "phone",
    ];
    const hasEmpty = requiredFields.some(
      (field) => !`${address[field] ?? ""}`.trim()
    );
    if (hasEmpty) {
      toast.error("Please fill all address fields.");
      return;
    }

    const payload = Object.keys(address).reduce((acc, key) => {
      acc[key] =
        typeof address[key] === "string" ? address[key].trim() : address[key];
      return acc;
    }, {});

    try {
      const { data } = await axios.post(`${API_URL}/address/add`, {
        address: {
          ...payload,
          zipcode: Number(payload.zipcode),
        },
        userId: user._id,
      });
      if (data.success) {
        toast.success("Address saved successfully");
        setAddress({
          firstName: "",
          lastName: "",
          email: "",
          street: "",
          city: "",
          state: "",
          zipcode: "",
          country: "",
          phone: "",
        });
        setShowForm(false);
        fetchAddresses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${API_URL}/address/${user._id}/${addressId}`
      );
      if (data.success) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchAddresses();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="mt-16 pb-16 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl text-gray-500">
        Manage Your <span className="font-semibold text-primary">Addresses</span>
      </p>

      {/* Display existing addresses */}
      {!showForm && addresses.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Saved Addresses ({addresses.length})
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dull transition"
            >
              + Add New Address
            </button>
          </div>
          <div className="max-w-2xl">
            {addresses.map((addr) => (
              <AddressCard
                key={addr._id}
                address={addr}
                onDelete={handleDeleteAddress}
              />
            ))}
          </div>
        </div>
      )}

      {/* No addresses found message */}
      {!showForm && addresses.length === 0 && (
        <div className="mt-10 text-center py-12">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-lg text-gray-600 mb-6">No addresses found</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-8 py-3 rounded hover:bg-primary-dull transition"
          >
            Add Your First Address
          </button>
        </div>
      )}

      {/* Add address form */}
      {showForm && (
        <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
          <div className="flex-1 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Add New Address
              </h2>
              {addresses.length > 0 && (
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  handleChange={handleChange}
                  address={address}
                />
                <InputField
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  handleChange={handleChange}
                  address={address}
                />
              </div>
              <InputField
                type="email"
                placeholder="Email address"
                name="email"
                handleChange={handleChange}
                address={address}
              />
              <InputField
                type="text"
                placeholder="Street"
                name="street"
                handleChange={handleChange}
                address={address}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="text"
                  placeholder="City"
                  name="city"
                  handleChange={handleChange}
                  address={address}
                />
                <InputField
                  type="text"
                  placeholder="State"
                  name="state"
                  handleChange={handleChange}
                  address={address}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="number"
                  placeholder="Zip code"
                  name="zipcode"
                  handleChange={handleChange}
                  address={address}
                />
                <InputField
                  type="text"
                  placeholder="Country"
                  name="country"
                  handleChange={handleChange}
                  address={address}
                />
              </div>
              <InputField
                handleChange={handleChange}
                address={address}
                name="phone"
                type="text"
                placeholder="Phone"
              />
              <button
                type="submit"
                className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase font-medium"
              >
                Save Address
              </button>
            </form>
          </div>
          <img
            className="md:mr-16 mb-16 md:mt-0 max-w-md"
            src={assets.add_address_iamge}
            alt="Add address"
          />
        </div>
      )}
    </div>
  );
}
