import React, { useState, useEffect } from "react";
import "./bookcard.css";

const BookCard = ({ book, onSave, onLike, isSaved, isLiked, onOpenReviews }) => {
  const [reviewCount, setReviewCount] = useState(0);

  const info = book?.volumeInfo || {};
  const title = info.title || "Untitled";
  const image = info.imageLinks?.thumbnail || "https://via.placeholder.com/150";

  useEffect(() => {
    if (book?.id) {
      // FIX: Encode the ID to handle slashes correctly (e.g., /works/OL123W)
      const safeId = encodeURIComponent(book.id);
      
      fetch(`http://localhost:5000/api/auth/reviews/${safeId}`)
        .then((res) => res.json())
        .then((data) => {
          setReviewCount(Array.isArray(data) ? data.length : 0);
        })
        .catch((err) => {
          console.error("Card count fetch error:", err);
          setReviewCount(0);
        });
    }
  }, [book.id]);

  return (
    <div className="book_card">
      <div className="book_image_container" onClick={() => onOpenReviews(book)}>
        <img src={image} alt={title} loading="lazy" />
      </div>

      <div className="book_info">
        <h4 title={title}>{title}</h4>
        
        <div className="book_meta">
          <span className="rating">⭐ {info.averageRating || "4.0"}</span>
          
          <div className="icons_group">
            {/* Comment Icon with Badge */}
            <div className="comment_wrapper" onClick={() => onOpenReviews(book)}>
              <span className="comment_icon">💬</span>
              {reviewCount > 0 && (
                <span className="review_badge">{reviewCount}</span>
              )}
            </div>

            {/* Heart / Like Button */}
            <span 
              className={`heart ${isLiked ? "active" : ""}`} 
              onClick={(e) => {
                e.stopPropagation();
                onLike(book);
              }}
            >
              {isLiked ? "❤️" : "🤍"} 
            </span>
            
            {/* Save Button */}
            <span 
              className={`save ${isSaved ? "active" : ""}`} 
              onClick={(e) => {
                e.stopPropagation();
                onSave(book);
              }}
            >
              {isSaved ? "✓" : "✚"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;