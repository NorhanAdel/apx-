"use client";

interface Rating {
  id?: string | number;
  calculated_stars: number;
}

interface RatingsProps {
  ratings: Rating[];
}

export default function Ratings({ ratings = [] }: RatingsProps) {
  const total = ratings.length;

  const ratingStats = [5, 4, 3, 2, 1].map((star) => {
    const count = ratings.filter(
      (r) => r.calculated_stars === star
    ).length;

    return {
      star,
      value: total ? (count / total) * 100 : 0,
    };
  });

  const avgRating =
    total > 0
      ? (
          ratings.reduce(
            (sum, r) => sum + (r.calculated_stars || 0),
            0
          ) / total
        ).toFixed(1)
      : "0";

  return (
    <div dir="ltr" className="text-left mt-16">
      <h2 className="text-2xl font-bold text-center mb-8">
        Ratings
      </h2>

      {/* Bars */}
      <div className="space-y-4">
        {ratingStats.map((r) => (
          <div key={r.star} className="flex items-center gap-4">
            <span className="w-4">{r.star}</span>

            <div className="flex-1 bg-gray-800 h-3 rounded">
              <div
                className="bg-yellow-400 h-3 rounded transition-all duration-500"
                style={{ width: `${r.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Average */}
      <div className="text-right mt-6 text-yellow-400 font-semibold">
        ⭐ {avgRating} ({total} ratings)
      </div>
    </div>
  );
}