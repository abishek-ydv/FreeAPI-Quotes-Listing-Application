import { useState, useEffect, useMemo } from 'react';
import './index.css';

const API_URL = 'https://api.freeapi.app/api/v1/public/quotes';

function App() {
  const [quotes, setQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('quotes-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quotes-theme', theme);
  }, [theme]);

  const fetchQuotes = async (p) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?page=${p}&limit=10`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch');
      setQuotes(json.data.data);
      setTotalPages(json.data.totalPages);
      setTotalItems(json.data.totalItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchQuotes(page); }, [page]);

  const filtered = useMemo(() => {
    if (!search) return quotes;
    const q = search.toLowerCase();
    return quotes.filter(qt => qt.content.toLowerCase().includes(q) || qt.author.toLowerCase().includes(q));
  }, [quotes, search]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">Quote<span>Vault</span></div>
        <div className="nav-right">
          <span className="nav-stats">{totalItems} quotes</span>
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
        </div>
      </nav>

      <section className="hero">
        <h1>Words that <span className="accent">inspire</span></h1>
        <p>Browse timeless quotes from the greatest minds. Search by words or authors.</p>
      </section>

      <div className="controls">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input type="text" placeholder="Search quotes or authors..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading quotes...</span>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => fetchQuotes(page)}>Try Again</button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <h2>No quotes found</h2>
              <p>Try a different search term.</p>
            </div>
          ) : (
            <div className="quotes-grid">
              {filtered.map((q) => <QuoteCard key={q.id} quote={q} />)}
            </div>
          )}

          <div className="pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {pageNumbers.map((n) => (
              <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </>
      )}
    </>
  );
}

function QuoteCard({ quote }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quote.content}" — ${quote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="quote-card">
      <span className="quote-mark">"</span>
      <p className="quote-content">{quote.content}</p>
      <div className="quote-footer">
        <div className="quote-author-wrap">
          <div className="quote-author">— {quote.author}</div>
          {quote.tags.length > 0 && (
            <div className="quote-tags">
              {quote.tags.map(t => <span key={t} className="quote-tag">{t}</span>)}
            </div>
          )}
        </div>
        <button className={`quote-copy ${copied ? 'copied' : ''}`} onClick={handleCopy} aria-label="Copy quote">
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
