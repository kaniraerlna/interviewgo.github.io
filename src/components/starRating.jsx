import React from "react";

const StarRating = ({ rating }) => {
  const MAX_RATING = 5;

  // Ensure rating is a number and within the valid range
  const validRating = Number.isFinite(rating) ? Math.min(Math.max(rating, 0), MAX_RATING) : 0;
  
  // Calculate filled and empty stars
  const filledStars = Math.floor(validRating);
  const halfStars = validRating - filledStars > 0.5 ? 1 : 0;
  const emptyStars = MAX_RATING - filledStars - halfStars;

  return (
    <div className="flex items-center justify-center">
      {[...Array(filledStars)].map((_, index) => (
        <svg
          key={`filled-${index}`}
          className="w-6 h-6 text-yellow-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.244 3.841a1 1 0 00.95.69h4.041c.969 0 1.371 1.24.588 1.81l-3.274 2.373a1 1 0 00-.364 1.118l1.244 3.841c.3.921-.755 1.688-1.54 1.118l-3.274-2.373a1 1 0 00-1.176 0l-3.274 2.373c-.784.57-1.84-.197-1.54-1.118l1.244-3.841a1 1 0 00-.364-1.118L2.23 9.268c-.784-.57-.381-1.81.588-1.81h4.041a1 1 0 00.95-.69L9.049 2.927z"></path>
        </svg>
      ))}
      {halfStars > 0 && (
        <svg
          key="half"
          className="w-6 h-6 text-yellow-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.244 3.841a1 1 0 00.95.69h4.041c.969 0 1.371 1.24.588 1.81l-3.274 2.373a1 1 0 00-.364 1.118l1.244 3.841c.3.921-.755 1.688-1.54 1.118l-3.274-2.373a1 1 0 00-1.176 0l-3.274 2.373c-.784.57-1.84-.197-1.54-1.118l1.244-3.841a1 1 0 00-.364-1.118L2.23 9.268c-.784-.57-.381-1.81.588-1.81h4.041a1 1 0 00.95-.69L9.049 2.927z"></path>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.244 3.841a1 1 0 00.95.69h4.041c.969 0 1.371 1.24.588 1.81l-3.274 2.373a1 1 0 00-.364 1.118l1.244 3.841c.3.921-.755 1.688-1.54 1.118l-3.274-2.373a1 1 0 00-1.176 0l-3.274 2.373c-.784.57-1.84-.197-1.54-1.118l1.244-3.841a1 1 0 00-.364-1.118L2.23 9.268c-.784-.57-.381-1.81.588-1.81h4.041a1 1 0 00.95-.69L9.049 2.927z"></path>
        </svg>
      )}
      {[...Array(emptyStars)].map((_, index) => (
        <svg
          key={`empty-${index}`}
          className="w-6 h-6 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.244 3.841a1 1 0 00.95.69h4.041c.969 0 1.371 1.24.588 1.81l-3.274 2.373a1 1 0 00-.364 1.118l1.244 3.841c.3.921-.755 1.688-1.54 1.118l-3.274-2.373a1 1 0 00-1.176 0l-3.274 2.373c-.784.57-1.84-.197-1.54-1.118l1.244-3.841a1 1 0 00-.364-1.118L2.23 9.268c-.784-.57-.381-1.81.588-1.81h4.041a1 1 0 00.95-.69L9.049 2.927z"></path>
        </svg>
      ))}
      <span className="ml-2 text-gray-600">{validRating} / {MAX_RATING}</span>
    </div>
  );
};

export default StarRating;
