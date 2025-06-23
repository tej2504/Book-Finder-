import React, { useState, useEffect } from 'react';
import './style.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchBooks = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`
      );
      const data = await response.json();

      const formattedBooks = data.docs.map((book) => ({
        id: book.key,
        title: book.title,
        author: book.author_name ? book.author_name[0] : 'Unknown Author',
        publishYear: book.first_publish_year || 'Unknown',
        cover: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        isbn: book.isbn ? book.isbn[0] : null,
        pages: book.number_of_pages_median || 'Unknown',
      }));

      setBooks(formattedBooks);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchBooks(searchTerm);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && searchTerm.trim()) {
        searchBooks(searchTerm);
      }
    };
    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [searchTerm]);

  return (
    <div className="container">
      <div className="header">
        <h1>📚 Book Finder</h1>
        <p>Discover your next great read</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search for books by title, author, or keyword..."
        />
        <button type="submit">🔍</button>
      </form>

      {loading && (
        <div className="loading">Searching for books...</div>
      )}

      {error && (
        <div className="error">{error}</div>
      )}

      {books.length > 0 && !loading && (
        <div className="results">
          <h2>Found {books.length} books</h2>
          <div className="book-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-cover">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} />
                  ) : (
                    <div className="no-cover">📘</div>
                  )}
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p><strong>Author:</strong> {book.author}</p>
                  <p><strong>Year:</strong> {book.publishYear}</p>
                  {book.pages !== 'Unknown' && <p><strong>Pages:</strong> {book.pages}</p>}
                  {book.isbn && (
                    <a href={`https://openlibrary.org/isbn/${book.isbn}`} target="_blank" rel="noopener noreferrer">
                      View Details
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {books.length === 0 && !loading && searchTerm && !error && (
        <div className="no-results">
          <p>📘 No books found</p>
          <p>Try searching with different keywords</p>
        </div>
      )}

      {!searchTerm && books.length === 0 && !loading && (
        <div className="start-message">
          <p className="big-icon">📖</p>
          <h2>Start your book discovery</h2>
          <p>Enter a book title, author name, or keyword to begin searching</p>
        </div>
      )}
    </div>
  );
}

export default App;
