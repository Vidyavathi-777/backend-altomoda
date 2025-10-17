import { useCart } from "../Context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePlaceOrder = () => {
    clearCart();
    navigate("/success");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 pt-[250px]">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="space-y-3 border p-4 rounded-lg mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name} x {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold mt-3">
          <span>Total:</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 w-full"
      >
        Place Order
      </button>

      <Link to="/cart" className="text-gray-600 block text-center mt-4 underline">
        Back to Cart
      </Link>
    </div>
  );
};

export default CheckoutPage;
