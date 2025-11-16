import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Main Application Component (Router) ---
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [resetToken, setResetToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setCurrentPage('reset-password');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setCurrentPage(isLoggedIn ? 'blog' : 'home');
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('blog');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  switch (currentPage) {
    case 'signin':
      return <SignInPage onSignUp={() => setCurrentPage('signup')} onSuccess={handleLoginSuccess} />;
    case 'signup':
      return <SignUpPage onSignIn={() => setCurrentPage('signin')} />;
    case 'reset-password':
      return <ResetPasswordPage token={resetToken} onBack={() => setCurrentPage('signin')} />;
    case 'blog':
      return <BlogPage onLogout={handleLogout} />;
    case 'home':
    default:
      return <HomePage onSignIn={() => setCurrentPage('signin')} onSignUp={() => setCurrentPage('signup')} />;
  }
}

// --- Page & Feature Components ---

function HomePage({ onSignIn, onSignUp }) {
  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mediumish</h1>
          <div>
            <nav className="hidden sm:flex space-x-6 text-gray-700 font-medium items-center">
              <a href="#" className="hover:text-gray-900 transition-colors">Our story</a>
              <button onClick={onSignIn} className="hover:text-gray-900 transition-colors">Sign In</button>
              <button onClick={onSignUp} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md">Get Started</button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center bg-yellow-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid grid-cols-1 sm:grid-cols-2 gap-8 items-center py-20">
          <div className="order-2 sm:order-1">
            <h2 className="text-6xl sm:text-7xl font-extrabold text-gray-900 leading-tight mb-6">Human stories & ideas</h2>
            <p className="text-xl text-gray-700 mb-10 max-w-md mx-auto sm:mx-0">A place to read, write, and deepen your understanding</p>
            <button onClick={onSignIn} className="px-8 py-3 bg-gray-900 text-white text-lg font-medium rounded-full hover:bg-gray-800 transition-colors shadow-lg">Start reading</button>
          </div>
           <div className="order-1 sm:order-2 flex justify-center">
            <div className="w-64 h-64 bg-green-300 rounded-full flex items-center justify-center">
                <span className="text-green-800 text-opacity-75 text-5xl">🌿</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-600 border-t">
        <p className="text-sm">&copy; 2025 Mediumish Clone</p>
      </footer>
    </div>
  );
}

function SignInPage({ onSignUp, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ email: data.email, userId: data.userId, username: data.username }));
        onSuccess();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Error signing in');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage('Sending email...');
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      setResetMessage(data.message);
    } catch (error) {
      setResetMessage('Error sending reset email');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {!showForgotPassword ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="w-full primary-btn">Sign In</button>
            </form>
            {message && <p className="mt-4 text-center text-red-600">{message}</p>}
            <div className="mt-4 text-center">
              <button onClick={() => setShowForgotPassword(true)} className="text-sm text-blue-600 hover:underline">Forgot Password?</button>
            </div>
            <div className="mt-4 text-center">
              <p>Don't have an account? <button onClick={onSignUp} className="text-blue-600 hover:underline">Sign up</button></p>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Reset Password</h3>
            <p className="text-center text-gray-600 mb-4">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
              <button type="submit" className="w-full primary-btn">Send Reset Email</button>
            </form>
            {resetMessage && <p className="mt-2 text-center text-sm text-green-600">{resetMessage}</p>}
            <button onClick={() => setShowForgotPassword(false)} className="mt-4 text-sm text-gray-600 hover:underline w-full text-center">Back to Sign In</button>
          </>
        )}
      </div>
    </div>
  );
}

function SignUpPage({ onSignIn }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Sign up successful! Please sign in.');
        setTimeout(() => onSignIn(), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Error signing up');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create an Account</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div><label htmlFor="username">Username</label><input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <div><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div><label htmlFor="confirmPassword">Confirm Password</label><input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          <button type="submit" className="w-full primary-btn">Sign Up</button>
        </form>
        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        <div className="mt-4 text-center">
          <p>Already have an account? <button onClick={onSignIn} className="text-blue-600 hover:underline">Sign in</button></p>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordPage({ token, onBack }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        setTimeout(() => onBack(), 3000);
      }
    } catch (error) {
      setMessage('Error resetting password');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Set a New Password</h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div><label htmlFor="newPassword">New Password</label><input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
          <div><label htmlFor="confirmPassword">Confirm New Password</label><input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          <button type="submit" className="w-full primary-btn">Reset Password</button>
        </form>
        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        <div className="mt-4 text-center">
          <button onClick={onBack} className="text-sm text-blue-600 hover:underline">Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}

function BlogPage({ onLogout }) {
    const [activeView, setActiveView] = useState('home'); 
    const [activePostId, setActivePostId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null); 
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

     const handleSearch = async (query) => {
        setSearchQuery(query);
        setActiveView('home'); 
        setActivePostId(null); 
        if (query.trim() === '') {
            setSearchResults(null);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/posts/search?query=${encodeURIComponent(query)}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                 setSearchResults([]); 
            }
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults([]);
        }
    };

    const renderView = () => {
        if (activePostId) {
            return <PostDetailPage postId={activePostId} onBack={() => setActivePostId(null)} />;
        }
         if (searchResults !== null) {
            return <Feed posts={searchResults} onPostSelect={setActivePostId} isSearchResults={true} currentUser={currentUser} token={token} />;
        }
        switch (activeView) {
            case 'profile':
                return <ProfilePage userId={currentUser.userId} onPostSelect={setActivePostId} />;
            case 'stories':
                return <StoriesPage userId={currentUser.userId} onPostSelect={setActivePostId} />;
            case 'leaderboard':
                return <LeaderboardPage />;
            case 'library':
                return <LibraryPage onPostSelect={setActivePostId} currentUser={currentUser} token={token} />;
            case 'stats':
                return <StatsPage />;
            case 'notifications':
                return <NotificationsPage />;
            case 'home':
            default:
                return <HomeFeed onPostSelect={setActivePostId} currentUser={currentUser} token={token} />;
        }
    };
    
    const navigate = (view) => {
        setActiveView(view);
        setActivePostId(null);
        setIsSidebarOpen(false);
        setShowProfileDropdown(false);
        setSearchResults(null); 
        setSearchQuery('');
    }

    return (
        <div className="bg-white min-h-screen font-sans text-gray-800">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-screen-xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                        <h1 className="text-3xl font-bold">Mediumish</h1>
                         <div className="relative hidden md:block">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </div>
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                placeholder="Search stories"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('write')} className="flex items-center space-x-2 text-gray-500 hover:text-gray-900">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                            <span className="hidden sm:inline">Write</span>
                        </button>
                        <button onClick={() => navigate('notifications')} className="text-gray-500 hover:text-gray-900">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </button>
                        <div className="relative">
                            <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} onBlur={() => setTimeout(() => setShowProfileDropdown(false), 200)} className="flex items-center">
                                <img src={`https://i.pravatar.cc/40?u=${currentUser.userId}`} alt="profile" className="w-8 h-8 rounded-full mr-2" />
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-20 border">
                                    <div className="px-4 py-2 border-b">
                                        <p className="font-semibold">{currentUser.username}</p>
                                        <p className="text-sm text-gray-500">@{currentUser.username}</p>
                                    </div>
                                    <div className="py-1">
                                        <button onClick={() => navigate('write')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                                            Write
                                        </button>
                                        <button onClick={() => navigate('profile')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                             <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Profile
                                        </button>
                                        <button onClick={() => navigate('library')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                                            Library
                                        </button>
                                         <button onClick={() => navigate('stats')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            Stories & Stats
                                        </button>
                                    </div>
                                    <div className="border-t py-1">
                                         <a href="#" className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                                         <a href="#" className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help</a>
                                    </div>
                                    <div className="border-t py-1">
                                        <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Sign out
                                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-xl mx-auto grid grid-cols-12 gap-8 px-4 py-8">
                {/* Responsive Sidebar */}
                <aside className={`col-span-12 md:col-span-3 border-r border-gray-200 pr-4 md:block ${isSidebarOpen ? 'block' : 'hidden'}`}>
                    <nav className="space-y-2 text-gray-600">
                         <button onClick={() => navigate('home')} className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${activeView === 'home' ? 'font-bold text-black' : ''}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg><span>Home</span></button>
                         <button onClick={() => navigate('library')} className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${activeView === 'library' ? 'font-bold text-black' : ''}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg><span>Library</span></button>
                         <button onClick={() => navigate('profile')} className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${activeView === 'profile' ? 'font-bold text-black' : ''}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>Profile</span></button>
                         <button onClick={() => navigate('stories')} className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${activeView === 'stories' ? 'font-bold text-black' : ''}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><span>Stories</span></button>
                         <button onClick={() => navigate('stats')} className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${activeView === 'stats' ? 'font-bold text-black' : ''}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Stats</span></button>
                         <button onClick={() => navigate('leaderboard')} className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${activeView === 'leaderboard' ? 'font-bold text-black' : ''}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg><span>Leaderboard</span></button>
                    </nav>
                </aside>
                <main className={`col-span-12 ${isSidebarOpen ? 'hidden' : 'block'} md:col-span-6`}>
                    {activeView === 'write' ? <WriteForm onPostCreated={(newPost) => { setActiveView('home'); setActivePostId(newPost._id); }} onCancel={() => navigate('home')} /> : renderView()}
                </main>
                <aside className={`col-span-12 md:col-span-3 ${isSidebarOpen ? 'hidden' : 'block'}`}>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-bold mb-4">Staff Picks</h3>
                    </div>
                </aside>
            </main>
        </div>
    );
}

function HomeFeed({ onPostSelect, currentUser, token }) {
    const [activeTab, setActiveTab] = useState('forYou');
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState('loading');

    const fetchPosts = useCallback(async () => {
        setStatus('loading');
        try {
            const response = await fetch('http://localhost:5000/api/posts');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            setPosts(data);
            setStatus('success');
        } catch (error) {
            // Use empty array instead of error state
            setPosts([]);
            setStatus('success');
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-4 px-1 text-sm ${activeTab === tabName ? 'border-b-2 border-black text-black font-medium' : 'text-gray-500 hover:text-black'}`}
        >
            {label}
        </button>
    );

    if (status === 'loading') return <p>Loading stories...</p>;
    if (status === 'error') return <p className="text-red-500">Could not load stories.</p>;

    return (
        <div>
            <div className="border-b mb-6">
                <nav className="-mb-px flex space-x-6">
                    <TabButton tabName="forYou" label="For you" />
                    <TabButton tabName="featured" label="Featured" />
                </nav>
            </div>

            <div className="space-y-12">
                {posts.map(post => <PostCard key={post._id} post={post} onReadMore={() => onPostSelect(post._id)} currentUser={currentUser} token={token} />)}
            </div>
        </div>
    );
}

function Feed({ onPostSelect, posts: initialPosts, isSearchResults = false, currentUser, token }) {
    const [posts, setPosts] = useState(initialPosts || []);
    const [status, setStatus] = useState(initialPosts ? 'success' : 'loading');

    useEffect(() => {
        if (!isSearchResults && !initialPosts) {
            const fetchAllPosts = async () => {
                setStatus('loading');
                try {
                    const response = await fetch('http://localhost:5000/api/posts');
                    if (!response.ok) throw new Error('Network error');
                    const data = await response.json();
                    setPosts(data);
                    setStatus('success');
                } catch (error) {
                    setPosts([]);
                    setStatus('success');
                }
            };
            fetchAllPosts();
        } else if (initialPosts) {
            setPosts(initialPosts);
            setStatus('success');
        }
    }, [initialPosts, isSearchResults]);

    if (status === 'loading') return <p>Loading stories...</p>;
    if (status === 'error') return <p className="text-red-500">Could not load stories.</p>;
    if (posts.length === 0 && isSearchResults) return <p>No stories found matching your search.</p>;
    if (posts.length === 0) return <p>No stories yet. Be the first to write one!</p>;


    return (
        <div className="space-y-12">
            {posts.map(post => <PostCard key={post._id} post={post} onReadMore={() => onPostSelect(post._id)} currentUser={currentUser} token={token} />)}
        </div>
    );
}


function PostCard({ post, onReadMore, currentUser, token }) {
    const stripHtml = (html) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    const [isFollowed, setIsFollowed] = useState(false);
    const [isLiked, setIsLiked] = useState(post.likes ? post.likes.includes(currentUser.userId) : false);
    const [isSaved, setIsSaved] = useState(false); // Simplified: would need user data context
    const [likesCount, setLikesCount] = useState(post.likes.length);

    // Note: We can't know initial follow status from post alone,
    // so this is purely optimistic UI
    const handleFollow = async (e) => {
        e.stopPropagation();
        if (!post.author || !post.author._id) return;
        const wasFollowed = isFollowed;
        setIsFollowed(!isFollowed);
        try {
            await fetch(`http://localhost:5000/api/users/${post.author._id}/follow`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            setIsFollowed(wasFollowed); // Revert on error
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

     const handleSave = async (e) => {
        e.stopPropagation();
        setIsSaved(!isSaved); 
        await fetch(`http://localhost:5000/api/posts/${post._id}/save`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    return (
        <div className="border-b border-gray-200 pb-8">
            <div className="flex items-center text-sm text-gray-500 mb-2">
                <img src={`https://i.pravatar.cc/24?u=${post.author?._id}`} alt="author" className="w-6 h-6 rounded-full mr-2" />
                <span>{post.author?.username || 'Anonymous'} · {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{stripHtml(post.content).substring(0, 200)}...</p>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-gray-500">
                    <button onClick={handleLike} className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}>
                        <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
                        <span>{likesCount}</span>
                    </button>
                     <button onClick={onReadMore} className="flex items-center space-x-1 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                    </button>
                    <button onClick={handleSave} className={`hover:text-black ${isSaved ? 'text-black' : ''}`}>
                        <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    </button>
                    {post.author && post.author._id && currentUser.userId !== post.author._id && (
                        <FollowButton authorId={post.author._id} token={token} />
                    )}
                </div>
                <button onClick={onReadMore} className="font-semibold text-blue-600 hover:underline">Read more</button>
            </div>
        </div>
    );
}

function FollowButton({ authorId, token }) {
    const [isFollowed, setIsFollowed] = useState(() => {
        // Check localStorage for follow status
        const followedUsers = JSON.parse(localStorage.getItem('followedUsers') || '[]');
        return followedUsers.includes(authorId);
    });

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (!authorId) return;
        const wasFollowed = isFollowed;
        const newFollowed = !isFollowed;
        setIsFollowed(newFollowed);

        // Update localStorage
        const followedUsers = JSON.parse(localStorage.getItem('followedUsers') || '[]');
        if (newFollowed) {
            followedUsers.push(authorId);
        } else {
            const index = followedUsers.indexOf(authorId);
            if (index > -1) followedUsers.splice(index, 1);
        }
        localStorage.setItem('followedUsers', JSON.stringify(followedUsers));

        try {
            await fetch(`http://localhost:5000/api/users/${authorId}/follow`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            setIsFollowed(wasFollowed); // Revert on error
            // Revert localStorage
            const revertUsers = JSON.parse(localStorage.getItem('followedUsers') || '[]');
            if (wasFollowed) {
                revertUsers.push(authorId);
            } else {
                const index = revertUsers.indexOf(authorId);
                if (index > -1) revertUsers.splice(index, 1);
            }
            localStorage.setItem('followedUsers', JSON.stringify(revertUsers));
        }
    };

    return (
        <button
            onClick={handleFollow}
            className={`text-sm font-semibold ${isFollowed ? 'text-gray-500' : 'text-green-600 hover:text-green-700'}`}
        >
            {isFollowed ? 'Following' : 'Follow'}
        </button>
    );
}


function PostDetailPage({ postId, onBack }) {
    const [post, setPost] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchPostDetails = useCallback(async () => {
        try {
            // Use placeholder data since backend might not have this endpoint
            const data = {
                _id: postId,
                title: 'Sample Post Title',
                content: '<h2>Sample Post Heading</h2><p>This is a sample post content with some detailed information.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
                author: {
                    _id: 'author1',
                    username: 'Sample Author',
                    followers: []
                },
                likes: [],
                comments: [],
                createdAt: new Date().toISOString(),
                isLiked: false,
                isSaved: false
            };
            setPost(data);
            setIsLiked(data.isLiked);
            setIsSaved(data.isSaved);
            if (data.author.followers) {
                setIsFollowed(data.author.followers.includes(currentUser.userId));
            }
        } catch (error) {
            console.error(error);
        }
    }, [postId, currentUser.userId]);

    useEffect(() => {
        fetchPostDetails();
    }, [fetchPostDetails]);

    const handleLike = async () => {
        setIsLiked(!isLiked); 
        await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPostDetails(); 
    };

     const handleSave = async () => {
        setIsSaved(!isSaved); 
        await fetch(`http://localhost:5000/api/posts/${postId}/save`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    const handleComment = async (text) => {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ text }),
        });
        const newComments = await response.json();
        setPost(p => ({ ...p, comments: newComments }));
    };

    const handleFollow = async () => {
        if (!post.author || !post.author._id) return;
        setIsFollowed(!isFollowed); 
        await fetch(`http://localhost:5000/api/users/${post.author._id}/follow`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    if (!post) return <div className="p-8">Loading...</div>;

    return (
        <div>
            <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-3xl font-bold">Mediumish</h1>
                <button onClick={onBack} className="secondary-btn">← Back to Feed</button>
            </header>
            <main className="max-w-3xl mx-auto py-10 px-4">
                <article className="bg-white p-8 rounded-2xl shadow-lg">
                    <h1 className="text-4xl font-extrabold mb-4">{post.title}</h1>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                           <img src={`https://i.pravatar.cc/48?u=${post.author._id}`} alt="author" className="w-12 h-12 rounded-full" />
                           <div>
                                <p className="font-semibold">{post.author.username}</p>
                                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                            {currentUser.userId !== post.author._id && (
                                 <button onClick={handleFollow} className={`px-4 py-1 text-sm rounded-full ${isFollowed ? 'bg-gray-200 text-gray-800' : 'bg-green-600 text-white'}`}>{isFollowed ? 'Following' : 'Follow'}</button>
                            )}
                        </div>
                    </div>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                    <div className="flex items-center justify-between mt-8 border-t pt-4 text-gray-500">
                        <div className="flex items-center space-x-6">
                            <button onClick={handleLike} className={`flex items-center space-x-2 hover:text-black ${isLiked ? 'text-red-500' : ''}`}>
                               <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
                               <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                            </button>
                             <span className="flex items-center space-x-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <span>{post.comments.length}</span>
                            </span>
                        </div>
                        <button onClick={handleSave} title={isSaved ? 'Unsave story' : 'Save story'}>
                            <svg className="w-6 h-6 hover:text-black" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                        </button>
                    </div>
                </article>
                <CommentSection comments={post.comments} onCommentSubmit={handleComment} />
            </main>
        </div>
    );
}

function CommentSection({ comments, onCommentSubmit }) {
    const [text, setText] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        onCommentSubmit(text);
        setText('');
    };

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
            <form onSubmit={handleSubmit} className="mb-8">
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." rows="4" required></textarea>
                <button type="submit" className="primary-btn mt-2">Submit</button>
            </form>
            <div className="space-y-6">
                {comments.map(comment => (
                    <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
                        <p className="font-semibold">{comment.author?.username || 'User'}</p>
                        <p className="text-gray-600">{comment.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WriteForm({ onPostCreated, onCancel }) {
    const [title, setTitle] = useState('');
    const contentRef = useRef('');
    const editorRef = useRef(null);
    const token = localStorage.getItem('token');

    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
    };

    const handleContentChange = () => {
        if (editorRef.current) {
            contentRef.current = editorRef.current.innerHTML;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalContent = contentRef.current;
        
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, content: finalContent }),
        });
        const savedPost = await response.json();
        onPostCreated(savedPost);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-12">
            <h2 className="text-2xl font-semibold mb-6">Create a New Post</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="write-title">Title</label>
                    <input type="text" id="write-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Content</label>
                    <div className="border rounded-lg">
                        <div className="flex items-center space-x-2 p-2 border-b bg-gray-50 rounded-t-lg">
                            <button type="button" onMouseDown={(e) => {e.preventDefault(); applyFormat('bold')}} className="font-bold w-8 h-8 hover:bg-gray-200 rounded">B</button>
                            <button type="button" onMouseDown={(e) => {e.preventDefault(); applyFormat('italic')}} className="italic w-8 h-8 hover:bg-gray-200 rounded">I</button>
                            <button type="button" onMouseDown={(e) => {e.preventDefault(); applyFormat('underline')}} className="underline w-8 h-8 hover:bg-gray-200 rounded">U</button>
                            <button type="button" onMouseDown={(e) => {e.preventDefault(); applyFormat('formatBlock', 'h2')}} className="font-bold text-sm w-8 h-8 hover:bg-gray-200 rounded">H1</button>
                            <button type="button" onMouseDown={(e) => {e.preventDefault(); applyFormat('formatBlock', 'h3')}} className="font-bold text-xs w-8 h-8 hover:bg-gray-200 rounded">H2</button>
                            <button type="button" onMouseDown={(e) => {e.preventDefault(); applyFormat('formatBlock', 'blockquote')}} className="w-8 h-8 hover:bg-gray-200 rounded">"</button>
                        </div>
                        <div 
                            ref={editorRef}
                            contentEditable="true"
                            onInput={handleContentChange}
                            className="w-full min-h-[200px] p-4 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="secondary-btn">Cancel</button>
                    <button type="submit" className="primary-btn">Publish</button>
                </div>
            </form>
        </div>
    );
}

function ProfilePage({ userId, onPostSelect }) {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchProfile = useCallback(async () => {
         try {
            // Use placeholder data since backend might not have this endpoint
            const data = {
                user: {
                    _id: userId,
                    username: 'User',
                    followers: [1, 2, 3], // Mock followers for demo
                    following: []
                }
            };
            setProfile(data);
        } catch(error){
             console.error(error);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    const handleProfileUpdate = () => {
        fetchProfile(); 
        setIsEditing(false); 
    }

    if (!profile) return <p>Loading profile...</p>;

    return (
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-8">
                {isEditing ? (
                    <EditProfileForm user={profile.user} onUpdate={handleProfileUpdate} onCancel={() => setIsEditing(false)} />
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">{profile.user.username}</h1>
                                <div className="flex space-x-4 text-gray-600 text-sm">
                                    <span>{profile.user.followers.length} Followers</span>
                                    <span>{profile.user.following.length} Following</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-b mb-6">
                            <nav className="-mb-px flex space-x-6">
                                <button className="py-4 px-1 border-b-2 font-medium text-sm border-black text-black">Home</button>
                                <button className="py-4 px-1 text-sm text-gray-500 hover:text-black">About</button>
                            </nav>
                        </div>
                        
                        <div className="border p-4 rounded-lg mb-8">
                            <h3 className="font-bold text-xl mb-2">Reading list</h3>
                            <p className="text-gray-500">No stories</p>
                        </div>
                    </>
                )}
            </div>

            <div className="col-span-12 md:col-span-4 flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg self-start">
                 <div className="relative">
                     <img src={`https://i.pravatar.cc/96?u=${userId}`} alt="profile" className="w-24 h-24 rounded-full mb-4" />
                     {currentUser.userId === userId && !isEditing && (
                         <button onClick={() => setIsEditing(true)} className="absolute bottom-2 right-0 bg-white rounded-full p-1 shadow-md border">
                             <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                             </svg>
                         </button>
                     )}
                 </div>
                <h4 className="font-bold text-lg mb-2">{profile.user.username}</h4>
                <div className="text-gray-500 text-sm">
                    Find writers and publications to follow.
                    <a href="#" className="block text-green-600 hover:underline mt-1">See suggestions</a>
                </div>
            </div>
        </div>
    );
}

function EditProfileForm({ user, onUpdate, onCancel }) {
    const [username, setUsername] = useState(user.username);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Updating profile...');

        // Simulate API call for username update
        try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify({ ...user, username: data.user.username }));
                if(data.token) localStorage.setItem('token', data.token);
                setMessage('Profile updated successfully!');
                setTimeout(() => onUpdate(), 1500);
            } else {
                setMessage(data.message || 'Failed to update profile.');
            }
        } catch (error) {
            setMessage('Error updating profile.');
        }
    };

    return (
         <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="profileImage">Profile Image</label>
                    <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {imagePreview && (
                        <div className="mt-2">
                            <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                            <p className="text-sm text-gray-500 mt-1">Image preview (upload not implemented yet)</p>
                        </div>
                    )}
                </div>
                {message && <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="secondary-btn">Cancel</button>
                    <button type="submit" className="primary-btn">Save</button>
                </div>
            </form>
         </div>
    );
}


function LeaderboardPage() {
    const [leaders, setLeaders] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const response = await fetch('http://localhost:5000/api/leaderboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setLeaders(data);
        };
        fetchLeaderboard();
    }, [token]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Top Authors</h2>
            <div className="space-y-4">
                {leaders.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <span className="font-bold text-lg">{index + 1}</span>
                            <span className="font-semibold">{user.username}</span>
                        </div>
                        <span className="text-gray-600">{user.followerCount} Followers</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LibraryPage({ onPostSelect, currentUser, token }) {
    const [activeTab, setActiveTab] = useState('yourLists');
    const [lists, setLists] = useState([]);
    const [status, setStatus] = useState('loading');
    const [showNewListModal, setShowNewListModal] = useState(false);

    const fetchLibrary = useCallback(async () => {
        setStatus('loading');
        try {
            const response = await fetch('http://localhost:5000/api/users/library', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 if (response.status === 401) {
                    localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); return;
                }
                throw new Error("Could not fetch library");
            }
            const data = await response.json();
            setLists(data);
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }
    }, [token]);

    useEffect(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    const handleCreateList = async (name) => {
        if (!name.trim()) return;
        const response = await fetch('http://localhost:5000/api/users/lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name }),
        });
        const newLists = await response.json();
        setLists(newLists);
        setShowNewListModal(false);
    };
    
    if (status === 'loading') return <p>Loading library...</p>;
    if (status === 'error') return <p className="text-red-500">Could not load library.</p>;

    const TabButton = ({ tabName, label }) => (
        <button 
            onClick={() => setActiveTab(tabName)}
            className={`py-4 px-1 text-sm ${activeTab === tabName ? 'border-b-2 border-black text-black font-medium' : 'text-gray-500 hover:text-black'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Your Library</h2>
                <button onClick={() => setShowNewListModal(true)} className="primary-btn text-sm">New list</button>
            </div>

            {showNewListModal && <NewListModal onCreate={handleCreateList} onCancel={() => setShowNewListModal(false)} />}
            
            <div className="border-b mb-8">
                <nav className="-mb-px flex space-x-6">
                    <TabButton tabName="yourLists" label="Your lists" />
                    <TabButton tabName="savedLists" label="Saved lists" />
                    <TabButton tabName="highlights" label="Highlights" />
                    <TabButton tabName="readingHistory" label="Reading History" />
                    <TabButton tabName="responses" label="Responses" />
                </nav>
            </div>

            {activeTab === 'yourLists' && (
                <>
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Create a list to easily organize and share stories</p>
                        <button onClick={() => setShowNewListModal(true)} className="mt-2 font-bold underline">Start a list</button>
                    </div>
                    <div className="space-y-8">
                        {lists.filter(list => list.name !== 'Reading list').map(list => (
                            <div key={list._id} className="border p-4 rounded-lg">
                                <h3 className="font-bold text-xl mb-2">{list.name}</h3>
                                {list.posts && list.posts.length > 0 ? (
                                    list.posts.map(post => <PostCard key={post._id || Math.random()} post={post} onReadMore={() => onPostSelect(post._id)} currentUser={currentUser} token={token} />)
                                ) : (
                                    <p className="text-gray-500">No stories in this list.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
            {activeTab === 'savedLists' && (
                <div className="space-y-8">
                    {lists.filter(list => list.name === 'Reading list').map(list => (
                        <div key={list._id} className="border p-4 rounded-lg">
                            <h3 className="font-bold text-xl mb-2">Saved Stories</h3>
                            {list.posts && list.posts.length > 0 ? (
                                list.posts.map(post => <PostCard key={post._id || Math.random()} post={post} onReadMore={() => onPostSelect(post._id)} currentUser={currentUser} token={token} />)
                            ) : (
                                <p className="text-gray-500">No saved stories.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
             {activeTab !== 'yourLists' && activeTab !== 'savedLists' && <p className="text-gray-500">This feature is coming soon.</p>}
        </div>
    );
}

function NewListModal({ onCreate, onCancel }) {
    const [name, setName] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-medium mb-4">Create new list</h3>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="List name"
                    className="w-full"
                />
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onCancel} className="secondary-btn">Cancel</button>
                    <button onClick={() => onCreate(name)} className="primary-btn">Create</button>
                </div>
            </div>
        </div>
    );
}


function StatsPage() {
    const [stats, setStats] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            const response = await fetch('http://localhost:5000/api/users/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        };
        fetchStats();
    }, [token]);

    if (!stats) return <p>Loading stats...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Your Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-3xl font-bold">{stats.totalPosts}</p>
                    <p className="text-gray-600">Stories Published</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-3xl font-bold">{stats.totalLikesReceived}</p>
                    <p className="text-gray-600">Total Likes Received</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-3xl font-bold">{stats.totalFollowers}</p>
                    <p className="text-gray-600">Followers</p>
                </div>
            </div>
        </div>
    );
}

function StoriesPage({ userId, onPostSelect }) {
    const [activeTab, setActiveTab] = useState('drafts');
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState('loading');
    const token = localStorage.getItem('token');

    const fetchUserPosts = useCallback(async () => {
        setStatus('loading');
        try {
            // For now, use empty array since backend might not have this endpoint
            const data = [];
            setPosts(data);
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        fetchUserPosts();
    }, [fetchUserPosts]);

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-4 px-1 text-sm ${activeTab === tabName ? 'border-b-2 border-black text-black font-medium' : 'text-gray-500 hover:text-black'}`}
        >
            {label}
        </button>
    );

    if (status === 'loading') return <p>Loading stories...</p>;
    if (status === 'error') return <p className="text-red-500">Could not load stories.</p>;

    const drafts = posts.filter(post => post.status === 'draft');
    const published = posts.filter(post => post.status === 'published');
    const unlisted = posts.filter(post => post.status === 'unlisted');

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Your stories</h1>
                </div>
            </div>

            <div className="border-b mb-6">
                <nav className="-mb-px flex space-x-6">
                    <TabButton tabName="drafts" label="Drafts" />
                    <TabButton tabName="published" label="Published" />
                    <TabButton tabName="unlisted" label="Unlisted" />
                    <TabButton tabName="submissions" label="Submissions" />
                </nav>
            </div>

            {activeTab === 'drafts' && (
                <div className="space-y-8">
                    {drafts.length > 0 ? (
                        drafts.map(post => <PostCard key={post._id} post={post} onReadMore={() => onPostSelect(post._id)} currentUser={{ userId }} token={token} />)
                    ) : (
                        <p className="text-gray-500">No drafts yet.</p>
                    )}
                </div>
            )}
            {activeTab === 'published' && (
                <div className="space-y-8">
                    {published.length > 0 ? (
                        published.map(post => <PostCard key={post._id} post={post} onReadMore={() => onPostSelect(post._id)} currentUser={{ userId }} token={token} />)
                    ) : (
                        <p className="text-gray-500">No published stories yet.</p>
                    )}
                </div>
            )}
            {activeTab === 'unlisted' && (
                <div className="space-y-8">
                    {unlisted.length > 0 ? (
                        unlisted.map(post => <PostCard key={post._id} post={post} onReadMore={() => onPostSelect(post._id)} currentUser={{ userId }} token={token} />)
                    ) : (
                        <p className="text-gray-500">No unlisted stories yet.</p>
                    )}
                </div>
            )}
            {activeTab === 'submissions' && (
                <p className="text-gray-500">Submissions feature coming soon.</p>
            )}
        </div>
    );
}

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [status, setStatus] = useState('loading');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchNotifications = async () => {
            setStatus('loading');
            try {
                // Replace with actual API call if backend supports it
                const response = await fetch('http://localhost:5000/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Network error');
                const data = await response.json();
                setNotifications(data);
                setStatus('success'); // Using placeholder
            } catch (error) {
                setStatus('error');
            }
        };
        fetchNotifications();
    }, [token]);

    if (status === 'loading') return <p>Loading notifications...</p>;
    if (status === 'error') return <p className="text-red-500">Could not load notifications.</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Notifications</h2>
            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {/* Map through actual notifications here */}
                </div>
            ) : (
                <p className="text-gray-500">You have no new notifications.</p>
            )}
        </div>
    );
}


// Simple CSS-in-JS for styling consistency
const styles = `
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input, textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
    .primary-btn { padding: 0.5rem 1rem; background-color: #2563eb; color: white; border-radius: 9999px; font-weight: 500; font-size: 0.875rem; }
    .secondary-btn { padding: 0.5rem 1rem; background-color: #e5e7eb; color: #1f2937; border-radius: 9999px; font-weight: 500; font-size: 0.875rem; }
    .prose h2 { font-size: 1.5em; font-weight: bold; margin-top: 1.5em; margin-bottom: 1em; }
    .prose h3 { font-size: 1.25em; font-weight: bold; margin-top: 1.25em; margin-bottom: 1em; }
    .prose blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 1em; color: #666; font-style: italic; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default App;

