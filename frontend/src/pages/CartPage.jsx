import { useCart } from "../Context/CartContext";
import { useUser } from "../Context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-[180px] px-4 bg-white">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Please Login</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to view your cart
        </p>
        <Link
          to="/auth"
          className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[180px] bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-[250px] px-4 bg-white">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty 🛍️</h2>
        <p className="text-gray-600 mb-6">
          Start adding some items to your cart!
        </p>
        <Link
          to="/"
          className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[250px] pb-20 font-body">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-wider text-black uppercase font-heading">
            QUICK CART
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-700 hover:text-red-600 underline"
          >
            Remove all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
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
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+";
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-lg font-bold uppercase text-black tracking-wider mb-1 font-heading">
                        {item.product?.brand || "Brand"}
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        {item.product?.title || "Product"}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">
                        Size: {item.size || item.product?.size || "TU"}
                      </p>
                      
                      {/* Original Price and Discount */}
                      {item.originalPrice && item.originalPrice > item.priceSnapshot && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 line-through">
                            €{item.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-sm font-semibold text-red-600">
                            -{Math.round((1 - item.priceSnapshot / item.originalPrice) * 100)}%
                          </span>
                          <span className="text-sm font-bold text-black">
                            €{item.priceSnapshot.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {(!item.originalPrice || item.originalPrice === item.priceSnapshot) && (
                        <span className="text-sm font-bold text-black mt-1 block">
                          €{item.priceSnapshot.toFixed(2)}
                        </span>
                      )}
                    </div>
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
                      <span className="px-4 py-1 font-medium text-black bg-white border-x border-gray-400 min-w-[40px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartItem(item.sku, item.qty + 1)}
                        className="px-3 py-1 text-lg hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.sku)}
                      className="text-sm text-black underline hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border border-gray-300 sticky top-24">
              <h3 className="text-lg font-bold tracking-wider mb-6 uppercase font-heading">
                SUBTOTAL
              </h3>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-800">
                  Items in the shopping cart:
                </span>
                <span className="font-bold text-black">
                  {cart.totalItems}
                </span>
              </div>

              <div className="flex justify-between items-center text-2xl font-bold text-black mb-2">
                <span>Total</span>
                <span>€ {cart.subtotal.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-600 mb-6 text-right">
                Import Duties not included
              </p>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Insert Discount Code"
                    className="w-full border border-gray-400 rounded-md px-4 py-3 text-sm pr-24 focus:outline-none focus:border-black"
                  />
                  <button className="absolute right-1 top-1 px-4 py-2 border border-black rounded-md text-sm bg-white hover:bg-gray-100 font-medium">
                    Use HEAT
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-white text-black py-3 rounded-md font-semibold border border-black hover:bg-gray-50 transition text-sm uppercase tracking-wide"
                >
                  Go to cart
                </button>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition text-sm uppercase tracking-wide"
                >
                  Proceed
                </button>
              </div>

              <div className="mt-6 text-xs text-gray-700 text-center space-y-1">
                <p className="text-gray-600">
                  Shipping costs are calculated on the next screen.
                </p>
                <div className="mt-2">
                  <span className="underline cursor-pointer hover:text-gray-900">
                    Terms and conditions
                  </span>{" "}
                  and{" "}
                  <span className="underline cursor-pointer hover:text-gray-900">
                    privacy policy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;