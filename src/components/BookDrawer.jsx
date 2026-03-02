import React, { useState, useEffect } from 'react';
import './drawer.css';

const BookDrawer = ({ book, user, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reviews when the book changes
  useEffect(() => {
    if (book?.id) {
      const safeBookId = encodeURIComponent(book.id);
      fetch(`http://localhost:5000/api/auth/reviews/${safeBookId}`)
        .then(res => res.json())
        .then(data => setReviews(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error loading reviews:", err));
    }
  }, [book]);

  if (!book) return null;

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !text.trim()) return;

    setIsSubmitting(true);
    const reviewData = {
      bookId: book.id,
      userId: user.id || user._id,
      username: user.username || "Anonymous",
      comment: text,
      rating: rating
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews(prev => [savedReview, ...prev]);
        setText(""); 
        setRating(5);
      }
    } catch (err) {
      console.error("Post Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id || user._id })
      });

      if (res.ok) {
        setReviews((prevReviews) => prevReviews.filter(r => r._id !== reviewId));
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div className="drawer_overlay" onClick={onClose}>
      <div className="drawer_content" onClick={e => e.stopPropagation()}>
        <button className="close_drawer" onClick={onClose}>&times;</button>
        
        <div className="drawer_header">
          <img src={book.volumeInfo?.imageLinks?.thumbnail} className="drawer_img" alt="cover" />
          <div className="header_text_group">
            <h2 className="drawer_title">{book.volumeInfo?.title}</h2>
            
            {/* Average Rating Summary */}
            <div className="rating_summary_bar">
              <span className="avg_stars">
                {"★".repeat(Math.round(averageRating))}
                <span className="empty_stars">{"★".repeat(5 - Math.round(averageRating))}</span>
              </span>
              <span className="avg_number">{averageRating}</span>
              <span className="total_count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        </div>
        
        <div className="drawer_reviews_section">
          <h3>{reviews.length === 0 ? "Be the first to review!" : "Community Reviews"}</h3>
          
          {user ? (
            <form onSubmit={handleSubmit} className="drawer_form">
              <div className="star_rating">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <button
                      type="button"
                      key={starValue}
                      className={starValue <= (hover || rating) ? "on" : "off"}
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHover(starValue)}
                      onMouseLeave={() => setHover(rating)}
                    >
                      <span className="star">&#9733;</span>
                    </button>
                  );
                })}
                <span className="rating_text">{rating}/5 Stars</span>
              </div>

              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="What did you think of this book?" 
                required 
              />
              <button type="submit" className="post_btn" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <p className="signin_msg">Sign in to leave a review.</p>
          )}

          <div className="drawer_list">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r._id} className="drawer_item">
                  <div className="item_header">
                    <strong>@{r.username}</strong>
                    <div className="item_meta">
                      <span className="item_rating">
                        {"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}
                      </span>
                      {/* Security Check: Only show delete for the owner */}
                      {(user?.id === r.userId || user?._id === r.userId) && (
                        <button 
                          className="delete_review_btn" 
                          onClick={() => handleDelete(r._id)}
                          title="Delete review"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="review_text">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="no_reviews">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDrawer;