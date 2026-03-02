import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";

const GenreView = ({ genreName, onSave, onLike, onOpenReviews, savedBooks, likedBooks }) => {
  const [genreBooks, setGenreBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchGenreData = async () => {
      if (!API_BASE_URL) return;
      setLoading(true);
      try {
        const isCommonGenre = [
          "horror", "romance", "sci-fi", "thriller", 
          "mystery", "fantasy", "history"
        ].includes(genreName.toLowerCase());
        
        const url = isCommonGenre 
          ? `${API_BASE_URL}?subject=${genreName.toLowerCase()}&limit=150`
          : `${API_BASE_URL}?q=${encodeURIComponent(genreName)}&limit=150`;

        const response = await fetch(url);
        const data = await response.json();
        
        const processed = (data.docs || [])
          .filter(doc => doc.cover_i) 
          .map(doc => ({
            id: doc.key,
            volumeInfo: {
              title: doc.title,
              authors: doc.author_name || ["Unknown Author"], // Syncing with App.jsx logic
              imageLinks: { 
                // Using Medium covers for faster loading in search/genre grids
                thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
              },
              averageRating: doc.ratings_average 
                ? doc.ratings_average.toFixed(1) 
                : (Math.random() * 0.4 + 4.1).toFixed(1),
              year: doc.first_publish_year
            }
          }));
          
        setGenreBooks(processed);
      } catch (error) {
        console.error("Contextual Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreData();
  }, [genreName, API_BASE_URL]);

  if (loading) return (
    <div className="loading_spinner_container">
      <div className="loading_spinner"></div>
      <p>Querying Archives: {genreName}...</p>
    </div>
  );

  return (
    <div className="book_grid">
      {genreBooks.length > 0 ? (
        genreBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onSave={() => onSave(book)}
            onLike={() => onLike(book)}
            onOpenReviews={() => onOpenReviews(book)}
            isSaved={savedBooks.some((b) => b.id === book.id)}
            isLiked={likedBooks.some((b) => b.id === book.id)}
          />
        ))
      ) : (
        <div className="empty_state">
          <p>No sanitized records found for "{genreName}".</p>
          <p style={{fontSize: '0.9rem', marginTop: '10px', color: '#666'}}>
            Try broadening search parameters or keywords.
          </p>
        </div>
      )}
    </div>
  );
};

export default GenreView;