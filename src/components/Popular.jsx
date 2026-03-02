import React from "react";
import BookCard from "./BookCard";

const Popular = ({ allBooks, onSave, onLike, savedBooks, likedBooks }) => {
  // Sort by year (Newest first)
  const popularBooks = [...allBooks].sort((a, b) => (b.volumeInfo.year || 0) - (a.volumeInfo.year || 0));

  return (
    <div className="book_grid">
      {popularBooks.map((book) => (
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

export default Popular;