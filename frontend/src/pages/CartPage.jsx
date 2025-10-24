import { useCart } from "../Context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cartItems, updateQty, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (acc, item) => acc + item.stock_price * item.qty,
    0
  );

  const handleCheckout = () => {
    clearCart(); // clear cart on checkout
    navigate("/checkout"); // navigate to success page
  };

  if (cartItems.length === 0)
    return (
      <div className="text-center py-20 pt-[150px]">
        <h2 className="text-2xl font-semibold">Your cart is empty 🛍️</h2>
        <Link to="/" className="text-blue-600 underline mt-4 block">
          Continue Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 pt-[250px]">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <div
            key={item.item_id.$oid}
            className="flex flex-col md:flex-row justify-between items-center border-b pb-6"
          >
            <div className="flex items-center gap-4 w-full md:w-2/3">
              {/* <img
                src={item.imgs[0].url} // first image
                alt={item.props?.mnf_code}
                className="w-24 h-24 object-cover rounded-lg"
              /> */}
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-700">₹{item.stock_price}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={() =>
                  updateQty(item.item_id.$oid, Math.max(1, item.qty - 1))
                }
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-6 text-center">{item.qty}</span>
              <button
                onClick={() => updateQty(item.item_id.$oid, item.qty + 1)}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item.item_id.$oid)}
                className="ml-4 text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t pt-6">
        <h2 className="text-2xl font-semibold">Total: ₹{total}</h2>
        <button
          onClick={handleCheckout}
          className="mt-4 md:mt-0 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
