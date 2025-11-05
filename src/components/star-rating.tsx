"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  totalStars?: number;
  size?: number;
  fill?: boolean;
  icon?: React.ReactNode;
}

export function StarRating({
  rating,
  totalStars = 5,
  size = 20,
  fill = true,
  icon = <Star />,
  className,
  ...props
}: StarRatingProps) {
  const stars = Array.from({ length: totalStars }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {stars.map((starValue) => (
        <div key={starValue} style={{ width: size, height: size }} className="relative">
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${Math.max(0, Math.min(1, rating - starValue + 1)) * 100}%` }}
          >
             <div style={{ width: size, height: size, color: "hsl(var(--primary))" }}>
                {React.cloneElement(icon as React.ReactElement, {
                    className: cn("fill-current h-full w-full", (icon as React.ReactElement).props.className),
                })}
            </div>
          </div>
           <div style={{ width: size, height: size, color: "hsl(var(--muted))" }}>
            {React.cloneElement(icon as React.ReactElement, {
                className: cn("fill-current h-full w-full", (icon as React.ReactElement).props.className),
            })}
        </div>
        </div>
      ))}
    </div>
  );
}

interface InteractiveStarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
    totalStars?: number;
    size?: number;
}

export function InteractiveStarRating({ rating, setRating, totalStars = 5, size = 24 }: InteractiveStarRatingProps) {
    const [hover, setHover] = React.useState(0);

    return (
        <div className="flex items-center space-x-1">
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                        className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                        aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                    >
                        <Star
                            className="transition-colors"
                            size={size}
                            fill={starValue <= (hover || rating) ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                            stroke={starValue <= (hover || rating) ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                        />
                    </button>
                );
            })}
        </div>
    );
}
