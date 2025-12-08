import { Link } from "react-router-dom";

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="text-sm text-gray-500 my-4">
      <ol className="flex items-center flex-wrap gap-2">

        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            
            {/* Link or Text */}
            {item.link ? (
              <Link
                to={item.link}
                className="hover:text-black transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-black font-medium">{item.name}</span>
            )}

            {/* Separator (except last item) */}
            {index < items.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}

          </li>
        ))}

      </ol>
    </nav>
  );
};

export default Breadcrumb;
