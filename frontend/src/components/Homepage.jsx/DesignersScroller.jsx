import React, { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import slidersData from "../../json/sliders.json";

const DesignerBrandScroller = () => {
  const { gender = "woman" } = useParams();

  const navitems = {
    man: "68f86b10734810ab97bb98d1",
    woman: "68f86b1c734810ab97bb9a2f"
  };

  const brandBlock = slidersData.sliders.find(
    (item) => item._id === "Brands" && item.gender === gender
  );

  const scrollRef = useRef(null);
  const animationRef = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  const SPEED = 1;

  if (!brandBlock) return null;

  const items = brandBlock.children;
  const doubled = [...items, ...items];


  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scroll = () => {
      if (!isHovering && !isTouching) {
        container.scrollLeft += SPEED;

        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }

      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isHovering, isTouching]);

  return (
    <div className="w-full px-6 py-10 bg-white">

      {/* Title */}
      <h2
        className="text-center text-4xl md:text-5xl font-light mb-16 tracking-wide uppercase"
        style={{ fontFamily: "Cormorant Garamond, Didot, serif" }}
      >
        {brandBlock.title}
      </h2>

      {/* SCROLLER */}
      <div
        ref={scrollRef}
        className="flex overflow-x-scroll scrollbar-hide"
        style={{ scrollBehavior: "auto", cursor: "grab", background: "#ffffff" }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsTouching(true)}
        onTouchEnd={() => setIsTouching(false)}
      >
        {doubled.map((brand, index) => (
          <div
            key={brand._id + index}
            className="flex-shrink-0"
            style={{
              width: "430px",
              margin: 0,
              padding: 0,
            }}
          >
            <div className="group m-2 p-0">

              {/* FULL IMAGE CARD */}
              <Link
              to={`/${gender}/${navitems[gender]}/${brand.title}/products`}
                className="rounded-none overflow-hidden bg-white shadow-none "
                style={{ margin: 0, padding: 0 }}
              >
                <img
                  src={brand.image}
                  alt={brand.title}
                  className="w-full h-[620px]  object-cover"
                  style={{
                    margin: 0,
                    padding: 0,
                    display: "block",
                  }}
                />
              </Link>

              {/* NAME */}
              <h3
                className="text-sm text-center mt-4  md:text-base font-light tracking-widest text-neutral-700 uppercase"
                style={{ fontFamily: "Didot, serif" }}
              >
                {brand.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DesignerBrandScroller;
