import React, { useEffect, useState } from "react";
import BookBanner from "./components/BookBanner";
import Navbar2 from "./components/Navbar2";
import BookCard from "./components/BookCard";
import Popular from "./components/Popular";
import TopRated from "./components/TopRated";
import GenreView from "./components/GenreView";
import Authenticate from "./components/Authenticate"; 
import Profile from "./components/Profile";
import BookDrawer from "./components/BookDrawer";
import "./App.css";

function App() {
  const [booksForBanner, setBooksForBanner] = useState([]);
  const [booksforRow, setBooksforRow] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("home"); 
  const [searchQuery, setSearchQuery] = useState("");

  // --- UI State ---
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [drawerBook, setDrawerBook] = useState(null); 

  // --- Auth & Data State ---
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [savedBooks, setSavedBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const localSaved = localStorage.getItem("savedBooks");
    const localLiked = localStorage.getItem("likedBooks");
    
    if (savedUser && savedUser !== "null") {
      setUser(JSON.parse(savedUser));
    }
    if (localSaved) setSavedBooks(JSON.parse(localSaved));
    if (localLiked) setLikedBooks(JSON.parse(localLiked));
    setIsReady(true);
  }, []);

  // 2. Persist to LocalStorage
  useEffect(() => {
    if (isReady) {
      localStorage.setItem("savedBooks", JSON.stringify(savedBooks));
      localStorage.setItem("likedBooks", JSON.stringify(likedBooks));
    }
  }, [savedBooks, likedBooks, isReady]);

  // 3. Database Sync Effect (Debounced)
  useEffect(() => {
    const syncWithDatabase = async () => {
      const activeUserId = user?.id || user?._id; // Handle both id formats
      if (!isReady || !activeUserId) return;

      try {
        await fetch(`http://localhost:5000/api/auth/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId: activeUserId, 
            savedBooks, 
            likedBooks 
          }),
        });
      } catch (err) { 
        console.error("Sync Error:", err); 
      }
    };

    const timeoutId = setTimeout(syncWithDatabase, 1500); // 1.5s delay to save server requests
    return () => clearTimeout(timeoutId);
  }, [savedBooks, likedBooks, user, isReady]);

  // 4. Global Data Fetching
  useEffect(() => {
    const fetchLibraryData = async () => {
      if (!API_BASE_URL) return;
      setLoading(true);
      try {
        const [homeRes, popRes, ratedRes] = await Promise.all([
          fetch(`${API_BASE_URL}?q=first_publish_year:[2023+TO+2026]&sort=new&limit=100`),
          fetch(`${API_BASE_URL}?q=subject:bestsellers&limit=150`),
          fetch(`${API_BASE_URL}?q=subject:award_winners&limit=150`)
        ]);

        const [homeData, popData, ratedData] = await Promise.all([
          homeRes.json(), popRes.json(), ratedRes.json()
        ]);

        const process = (docs) => (docs || [])
          .filter(doc => doc.cover_i)
          .map(doc => ({
            id: doc.key,
            volumeInfo: {
              title: doc.title,
              imageLinks: { 
                thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` // -M is faster than -L
              },
              averageRating: doc.ratings_average ? doc.ratings_average.toFixed(1) : (Math.random() * 0.4 + 4.1).toFixed(1),
              authors: doc.author_name || ["Unknown Author"]
            }
          }));

        const homeProcessed = process(homeData.docs);
        setBooksForBanner(homeProcessed.slice(0, 6));
        setBooksforRow(homeProcessed.slice(6));
        setPopularBooks(process(popData.docs)); 
        setTopRatedBooks(process(ratedData.docs));
      } catch (error) { 
        console.error("Fetch Error:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchLibraryData();
  }, [API_BASE_URL]);

  const toggleSaved = (book) => {
    if (!user) { setIsAuthOpen(true); return; }
    setSavedBooks(prev => prev.some(b => b.id === book.id) 
      ? prev.filter(b => b.id !== book.id) 
      : [...prev, book]
    );
  };

  const toggleLiked = (book) => {
    if (!user) { setIsAuthOpen(true); return; }
    setLikedBooks(prev => prev.some(b => b.id === book.id) 
      ? prev.filter(b => b.id !== book.id) 
      : [...prev, book]
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setSavedBooks([]);
    setLikedBooks([]);
    setCurrentView("home");
    window.location.reload();
  };

  const isGenreView = ["horror", "romance", "sci-fi", "thriller", "mystery", "fantasy", "history"].includes(currentView.toLowerCase());

  return (
    <div className="app_container">
      <header className="navbar1_container">
        <h1 className="main_logo_text">LuminaLib</h1>
      </header>

      <Navbar2 
        setCategory={setCurrentView} 
        onSearch={(q) => { setSearchQuery(q); setCurrentView("search results"); }} 
        activeTab={currentView} 
        user={user}
        onSignInClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />
      
      <Authenticate 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        setUser={setUser}
        setSavedBooks={setSavedBooks}
        setLikedBooks={setLikedBooks}
      />

      <BookDrawer 
        book={drawerBook} 
        user={user} 
        onClose={() => setDrawerBook(null)} 
      />

      <main className="main_content">
        {loading ? (
          <div className="loading_spinner_container">
             <div className="loading_spinner"></div>
             <p>Synchronizing Library...</p>
          </div>
        ) : (
          <div className="view_fade_in">
            {currentView === "home" && (
              <>
                <section className="banner_section herosection">
                  {booksForBanner.length > 0 && <BookBanner books={booksForBanner} />}
                </section>
                <div className="home_book_row">
                  <div className="book_grid">
                    {booksforRow.map((book) => (
                      <BookCard 
                        key={book.id} 
                        book={book} 
                        onSave={() => toggleSaved(book)} 
                        onLike={() => toggleLiked(book)} 
                        onOpenReviews={() => setDrawerBook(book)} 
                        isSaved={savedBooks.some(b => b.id === book.id)} 
                        isLiked={likedBooks.some(b => b.id === book.id)} 
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentView === "profile" && user && (
              <Profile user={user} setUser={setUser} />
            )}

            {currentView !== "home" && currentView !== "profile" && (
              <div className="category_container">
                <div className="category_header">
                  <h1 className="category_title">
                    {currentView === "search results" ? `Search: ${searchQuery}` : currentView}
                  </h1>
                </div>

                {(currentView === "liked" || currentView === "saved") && !user ? (
                   <div className="empty_state"><h2>Please Sign In to view your collection.</h2></div>
                ) : (
                  <>
                    {currentView === "popular" && <Popular allBooks={popularBooks} onSave={toggleSaved} onLike={toggleLiked} onOpenReviews={setDrawerBook} savedBooks={savedBooks} likedBooks={likedBooks} />}
                    {currentView === "top rated" && <TopRated allBooks={topRatedBooks} onSave={toggleSaved} onLike={toggleLiked} onOpenReviews={setDrawerBook} savedBooks={savedBooks} likedBooks={likedBooks} />}
                    
                    {currentView === "liked" && (
                      <div className="book_grid">
                        {likedBooks.length > 0 ? 
                          likedBooks.map(book => <BookCard key={book.id} book={book} onSave={() => toggleSaved(book)} onLike={() => toggleLiked(book)} onOpenReviews={() => setDrawerBook(book)} isSaved={savedBooks.some(b => b.id === book.id)} isLiked={true} />)
                          : <div className="empty_state"><h3>No liked books yet.</h3></div>
                        }
                      </div>
                    )}
                    
                    {currentView === "saved" && (
                      <div className="book_grid">
                        {savedBooks.length > 0 ? 
                          savedBooks.map(book => <BookCard key={book.id} book={book} onSave={() => toggleSaved(book)} onLike={() => toggleLiked(book)} onOpenReviews={() => setDrawerBook(book)} isSaved={true} isLiked={likedBooks.some(b => b.id === book.id)} />)
                          : <div className="empty_state"><h3>No saved books yet.</h3></div>
                        }
                      </div>
                    )}

                    {(isGenreView || currentView === "search results") && (
                      <GenreView genreName={currentView === "search results" ? searchQuery : currentView} onSave={toggleSaved} onLike={toggleLiked} onOpenReviews={setDrawerBook} savedBooks={savedBooks} likedBooks={likedBooks} />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;