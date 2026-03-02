import React, { useEffect, useState, useRef } from "react";
import "./book.css";

const BookBanner = ({ books }) => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (books.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % books.length);
      }, 4000); // Increased to 4s for better readability
    }
  };

  useEffect(() => {
    if (books.length > 0) startAutoSlide();

    const handleScroll = () => startAutoSlide();
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [books]); 

  if (!books || !books.length) return null;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % books.length);
    startAutoSlide(); 
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? books.length - 1 : prev - 1));
    startAutoSlide();
  };

  return (
    <div className="banner_main">
      <div className="banner_slider">
        <div
          className="banner_track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {books.map((book) => {
            const image = book.volumeInfo.imageLinks?.extraLarge ||
                          book.volumeInfo.imageLinks?.large ||
                          book.volumeInfo.imageLinks?.medium ||
                          book.volumeInfo.imageLinks?.thumbnail;
            
            if (!image) return null;

            return (
              <div
                className="banner_slide"
                key={book.id}
                style={{ backgroundImage: `url(${image})` }}
              >
                <div className="banner_overlay"></div>
                <div className="banner_content">
                  <img src={image} alt="" className="banner_image_focus" />
                  <div className="banner_text_box">
                    <h1>{book.volumeInfo.title}</h1>
                    <p>
                      {book.volumeInfo.description?.slice(0, 200) ||
                        "Experience this trending title on Bookflix today."}...
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="banner_arrow left" onClick={prevSlide}>‹</button>
      <button className="banner_arrow right" onClick={nextSlide}>›</button>
    </div>
  );
};

export default BookBanner;