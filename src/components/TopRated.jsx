import React from "react";
import BookCard from "./BookCard";

/**
 * TopRated Component
 * Responsible for rendering high-affinity content based on user and community ratings.
 * Leverages a descending sort algorithm to prioritize quality-driven data presentation.
 */
const TopRated = ({ allBooks, onSave, onLike, savedBooks, likedBooks }) => {
  
  // --- Computational Logic: Rating-Based Sorting ---
  // Transforms the raw dataset into a ranked collection. 
  // Employs the spread operator to treat the 'allBooks' prop as an immutable source.
  const ratedBooks = [...allBooks].sort((a, b) => 
    parseFloat(b.volumeInfo.averageRating) - parseFloat(a.volumeInfo.averageRating)
  );

  return (
    <div className="book_grid">
      {/* Iterative Rendering: 
        Maps ranked documents to BookCard components, injecting persistence 
        states (isSaved/isLiked) via referential lookup.
      */}
      {ratedBooks.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onSave={onSave}
          onLike={onLike}
          isSaved={savedBooks.some((b) => b.id === book.id)}
          isLiked={likedBooks.some((b) => b.id === book.id)}
        />
      ))}
    </div>
  );
};

export default TopRated;