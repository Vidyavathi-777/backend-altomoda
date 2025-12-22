import { useCart } from "../Context/CartContext";
import { useUser } from "../Context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { convertPriceToINR } from "../utils/CurrencyConversion";
import { ArrowLeft } from "lucide-react";

const CartPage = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      alert("Please login to checkout");
      navigate("/auth");
      return;
    }
    navigate("/checkout");
  };

  const convertedPrice = () => {
    let prices =  cart.items.priceSnapshot
    const covertedPrice = convertPriceToINR(prices)
    return convertedPrice

  }


  if (!user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-white px-4"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Didot, serif" }}>
          Please Login
        </h2>
        <p className="text-gray-600 mb-6 text-sm">You need to login to view your cart</p>
        <Link
          to="/auth"
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-900 transition-all"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-white px-4"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2
          className="text-2xl font-semibold mb-2 tracking-wide"
          style={{ fontFamily: "Didot, serif" }}
        >
          Your cart is empty 🛍️
        </h2>
        <p className="text-gray-600 mb-6 text-sm">Start adding some items to your cart</p>
        <Link
          to="/"
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-900 transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white pt-40 pb-20 lg:pt-[250px]"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-gray-300 pb-4">
                    <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Home</span>
            </button>
          </div>

          <h1
            className="text-3xl tracking-widest uppercase"
            style={{ fontFamily: "Didot, serif", letterSpacing: "0.1em" }}
          >
            Your Cart
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-600 hover:text-red-600 underline"
          >
            Remove all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row gap-6 items-start border-b border-gray-200 pb-6"
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.product?.image || "/placeholder.jpg"}
                    alt={item.product?.title || "Product"}
                    className="w-28 h-28 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+";
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3
                        className="text-lg font-semibold uppercase tracking-wide text-gray-900"
                        style={{ fontFamily: "Didot, serif" }}
                      >
                        {item.product?.brand || "Brand"}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {item.product?.title || "Product"}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">
                        Size: {item.size || item.product?.size || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.sku)}
                      className="text-gray-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="mt-2">
                    <span
                      className="text-base font-semibold text-gray-900"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Rs {item.priceSnapshot.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex border border-gray-400 rounded overflow-hidden">
                      <button
                        onClick={() =>
                          updateCartItem(item.sku, Math.max(1, item.qty - 1))
                        }
                        disabled={item.qty <= 1}
                        className="px-3 py-1 text-lg hover:bg-gray-100 disabled:text-gray-400"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-5 py-1 text-center font-medium bg-white text-gray-900">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartItem(item.sku, item.qty + 1)}
                        className="px-3 py-1 text-lg hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#fafafa] rounded-lg p-8 border border-gray-200 shadow-sm sticky top-24">
              <h3
                className="text-xl font-semibold mb-6 uppercase tracking-widest text-gray-900"
                style={{ fontFamily: "Didot, serif" }}
              >
                Summary
              </h3>

              <div className="flex justify-between text-sm text-gray-700 mb-3">
                <span>Items</span>
                <span>{cart.totalItems}</span>
              </div>

              <div className="flex justify-between items-center mb-4 text-xl font-semibold text-gray-900">
                <span>Total</span>
                <span>Rs {cart.subtotal.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-500 mb-8 text-right">
                Import Duties not included
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3 border border-gray-900 text-gray-900 rounded-md hover:bg-gray-100 uppercase tracking-wide transition-all text-sm"
                >
                  Continue Shopping
                </button>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 uppercase tracking-wide transition-all text-sm"
                >
                  Proceed to Checkout
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center mt-8 leading-relaxed">
                Shipping calculated on next screen.
                <br />
                <span className="underline cursor-pointer hover:text-gray-800">
                  Terms & Conditions
                </span>{" "}
                and{" "}
                <span className="underline cursor-pointer hover:text-gray-800">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
