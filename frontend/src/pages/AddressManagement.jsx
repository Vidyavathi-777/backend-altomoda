import React, { useState, useEffect } from "react";
import { useUser } from "../Context/UserContext";
import { MapPin, Home, Edit3, Trash2, Plus } from "lucide-react";

const AddressManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const {
    user,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getToken,
    refreshAddresses,
  } = useUser();

  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initialForm = {
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
    geo: { lat: "", lng: "" },
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    refreshAddresses();
  }, []);

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        label: editingAddress.label || "",
        line1: editingAddress.line1 || "",
        line2: editingAddress.line2 || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        pincode: editingAddress.pincode || "",
        country: editingAddress.country || "India",
        isDefault: !!editingAddress.isDefault,
        geo: {
          lat: editingAddress.geo?.lat ?? "",
          lng: editingAddress.geo?.lng ?? "",
        },
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingAddress]);

  const resetForm = () => {
    setEditingAddress(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
  };

  const safeAuthHeader = () => {
    const token = getToken();
    if (!token) return null;
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "lat" || name === "lng") {
      setFormData((prev) => ({ ...prev, geo: { ...prev.geo, [name]: value } }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const required = ["line1", "city", "state", "pincode"];
    for (let field of required) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        setError(`Please fill required field: ${field}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      const authHeader = safeAuthHeader();
      if (!authHeader) {
        setError("Auth token missing. Please sign in again.");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        pincode: String(formData.pincode).trim(),
        geo: {
          lat: formData.geo.lat !== "" ? Number(formData.geo.lat) : undefined,
          lng: formData.geo.lng !== "" ? Number(formData.geo.lng) : undefined,
        },
      };

      if (payload.geo.lat === undefined && payload.geo.lng === undefined) {
        delete payload.geo;
      }

      let res;
      if (editingAddress) {
        res = await fetch(`${API_URL}/v1/auth/me/addresses/${editingAddress._id}`, {
          method: "PUT",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/v1/auth/me/addresses`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.status === "success") {
        if (editingAddress) {
          await updateAddress(editingAddress._id, result.data);
          setSuccess("Address updated successfully!");
        } else {
          await addAddress(result.data);
          setSuccess("Address added successfully!");
        }
        resetForm();
        await refreshAddresses();
      } else if (res.status === 401) {
        setError("Unauthorized. Please login again.");
      } else {
        setError(result.message || `Failed to ${editingAddress ? "update" : "add"} address.`);
      }
    } catch (err) {
      console.error("handleSubmit error", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;

    setError("");
    setSuccess("");

    try {
      const authHeader = safeAuthHeader();
      if (!authHeader) {
        setError("Auth token missing. Please sign in again.");
        return;
      }

      const res = await fetch(`${API_URL}/v1/auth/me/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        await deleteAddress(addressId);
        setSuccess("Address deleted successfully.");
        await refreshAddresses();
      } else if (res.status === 401) {
        setError("Unauthorized. Please login again.");
      } else {
        setError(body.message || "Failed to delete address.");
      }
    } catch (err) {
      console.error("handleDeleteAddress error", err);
      setError("Failed to delete address. Please try again.");
    }
  };

  const handleSetDefault = async (addressId) => {
    setError("");
    setSuccess("");

    try {
      const authHeader = safeAuthHeader();
      if (!authHeader) {
        setError("Auth token missing. Please sign in again.");
        return;
      }

      const res = await fetch(`${API_URL}/v1/auth/me/addresses/${addressId}`, {
        method: "PUT",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok && body.status === "success") {
        await setDefaultAddress(addressId);
        setSuccess("Default address updated!");
        await refreshAddresses();
      } else if (res.status === 401) {
        setError("Unauthorized. Please login again.");
      } else {
        setError(body.message || "Failed to set default address.");
      }
    } catch (err) {
      console.error("handleSetDefault error", err);
      setError("Failed to set default. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen bg-white py-24 px-4 lg:pt-[250px] pt-[180px]"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1
            className="text-4xl tracking-wide text-gray-900 mb-2"
            style={{ fontFamily: "Didot, serif", letterSpacing: "0.05em" }}
          >
            Address Book
          </h1>
          <p className="text-gray-600 text-sm tracking-wide">
            Manage your delivery and billing addresses
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 rounded-2xl p-8 bg-[#fafafa] shadow-sm">
              <h2
                className="text-xl mb-6 tracking-wide text-gray-900 uppercase"
                style={{ fontFamily: "Didot, serif" }}
              >
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { name: "label", label: "Label", placeholder: "Home / Work (optional)" },
                  { name: "line1", label: "Address Line 1 *", placeholder: "Street address" },
                  { name: "line2", label: "Address Line 2", placeholder: "Apartment, suite (optional)" },
                  { name: "city", label: "City *" },
                  { name: "state", label: "State *" },
                  { name: "pincode", label: "Pincode *" },
                  { name: "country", label: "Country" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm text-gray-700 mb-1">{f.label}</label>
                    <input
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleInputChange}
                      placeholder={f.placeholder}
                      required={f.label.includes("*")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-black"
                  />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Latitude (Optional)
                    </label>
                    <input
                      name="lat"
                      type="number"
                      step="any"
                      value={formData.geo.lat}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Longitude (Optional)
                    </label>
                    <input
                      name="lng"
                      type="number"
                      step="any"
                      value={formData.geo.lng}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-black text-white rounded-md hover:bg-gray-900 transition-all uppercase text-sm tracking-wide"
                  >
                    {loading ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
                  </button>
                  {editingAddress && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-3 border border-gray-400 rounded-md hover:bg-gray-100 transition-all text-sm uppercase tracking-wide"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Address Cards */}
          <div className="space-y-6">
            {addresses.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <MapPin className="mx-auto w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">No addresses saved yet.</p>
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address._id}
                  className={`border rounded-2xl p-5 shadow-sm transition-all ${
                    address.isDefault
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {address.isDefault && (
                    <span className="inline-block bg-black text-white text-[11px] px-2 py-0.5 rounded-full uppercase mb-2">
                      Default
                    </span>
                  )}
                  <h4
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "Didot, serif" }}
                  >
                    {address.label || "Address"}
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {address.line1}
                    {address.line2 && `, ${address.line2}`} <br />
                    {address.city}, {address.state} - {address.pincode}
                    <br />
                    {address.country}
                  </p>

                  {address.geo && (address.geo.lat || address.geo.lng) && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({address.geo.lat}, {address.geo.lng})
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4 text-xs uppercase tracking-wide">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address._id)}
                        className="text-gray-800 hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => setEditingAddress(address)}
                      className="text-gray-800 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressManagement;
