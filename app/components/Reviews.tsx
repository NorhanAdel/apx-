"use client";

import { useRef } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewsProps {}

export default function Reviews({}: ReviewsProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const reviews = [
    { name: "Ronald Richards", image: "/b2.jpg", rating: 5 },
    { name: "Ronald Richards", image: "/download3.jpg", rating: 5 },
    { name: "Ronald Richards", image: "/download5.jpg", rating: 5 },
    { name: "Ronald Richards", image: "/download3.jpg", rating: 5 },
    { name: "Ronald Richards", image: "/download3.jpg", rating: 5 },
  ];

  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      containerRef.current.scrollBy({
        left: dir === "left" ? -width / 1.5 : width / 1.5,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-10 md:mt-14 relative">
      {/* left arrow */}
      <button
        onClick={() => scroll("left")}
        className="
          absolute left-1 sm:left-2 md:left-0
          top-1/2 -translate-y-1/2
          z-10
          bg-black/40 hover:bg-black/70
          p-1.5 sm:p-2 md:p-3
          rounded-full
          transition
        "
      >
        <ChevronLeft size={18} className="sm:size-[20px] md:size-[24px]" />
      </button>

      {/* right arrow */}
      <button
        onClick={() => scroll("right")}
        className="
          absolute right-1 sm:right-2 md:right-0
          top-1/2 -translate-y-1/2
          z-10
          bg-black/40 hover:bg-black/70
          p-1.5 sm:p-2 md:p-3
          rounded-full
          transition
        "
      >
        <ChevronRight size={18} className="sm:size-[20px] md:size-[24px]" />
      </button>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="
          flex gap-4 sm:gap-6 md:gap-8
          overflow-x-auto
          no-scrollbar
          scroll-smooth
          px-6 sm:px-8 md:px-2
        "
      >
        {reviews.map((review, i) => (
          <div
            key={i}
            className="
              min-w-[220px] sm:min-w-[240px] md:min-w-[260px]
              bg-[#06163a]
              border border-[#102b5c]
              px-4 sm:px-6 md:px-8
              py-4 sm:py-5
              rounded-xl
              flex items-center gap-3 sm:gap-4
              shadow-[0_0_20px_rgba(0,60,255,0.15)]
              flex-shrink-0
            "
          >
            <Image
              src={review.image}
              alt="user"
              width={40}
              height={40}
              className="rounded-full object-cover w-9 h-9 sm:w-10 sm:h-10"
            />

            <div>
              <h4 className="text-white font-semibold text-xs sm:text-sm">
                {review.name}
              </h4>

              <div className="flex text-yellow-400 mt-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-4 md:mt-6">
        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
        <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
        <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
      </div>
    </div>
  );
}