import { Link } from "react-router-dom";

const SuccessPage = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Order Successful 🎉</h1>
      <p className="text-lg text-gray-700 mb-6">Thank you for your purchase!</p>
      <Link
        to="/"
        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default SuccessPage;
