import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  const location = useLocation();

  // /woman/68f86b.../products → ["woman", "68f8...", "products"]
  const pathnames = location.pathname.split("/").filter(x => x);

  // Construct dynamic breadcrumb items
  const breadcrumbItems = pathnames.map((value, index) => {
    const url = "/" + pathnames.slice(0, index + 1).join("/");

    let label = value;

    // ---------- CLEAN LABELS ----------
      // if (value === "woman") label = "Woman";
      // if (value === "man") label = "Man";
    // if (value === "products") label = "Products";
    // if (value === "product") label = "Product";
    // if (value === "new-arrivals") label = "New Arrivals";

    // Remove IDs from displaying
    if (value.match(/^[0-9a-fA-F]{12,}$/)) return null;

    // Capitalize normal words
    if (!label.includes(" ") && !label.includes("-")) {
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    return { label, url };
  }).filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 my-4 px-4">
      {/* Home Link */}
      <Link to="/" className="hover:text-black">Home</Link>

      {/* Each breadcrumb */}
      {breadcrumbItems.map((item, index) => (
        <span className="flex items-center" key={index}>
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />

          {index === breadcrumbItems.length - 1 ? (
            <span className="text-black font-medium">{item.label}</span>
          ) : (
            <Link to={item.url} className="hover:text-black">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
