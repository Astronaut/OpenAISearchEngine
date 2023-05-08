import React, { useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import './styles.css';
import SignupPage from './SignupPage';

const API_URL = 'http://localhost:3000/api';

const LoginPage = ({ onLogin, onSignupClick, onBackToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/authenticate`, {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <div>{error}</div>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={handleUsernameChange} autoComplete="username" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} autoComplete="current-password" />
        </div>
        <button type="submit">Login</button>
      </form>
      <button onClick={onSignupClick}>Sign Up</button>
    </div>
  );
};

const SearchPage = ({ token, handleLogout }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setResponse(response.data.response);
      setError('');
    } catch (err) {
      if (err.response.status === 401) {
        setError('You are not authorized to perform this action');
      } else if (err.response.status === 400) {
        setError('Please enter a query');
      } else {
        setError('Internal server error');
      }
      setResponse('');
    }
  };

  return (
    <div>
      <h1>OpenAI Search Engine</h1>
      <form onSubmit={() => handleLogout()}>
        <button type="submit">Logout</button>
      </form>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Enter a query"
        />
        <button type="submit">Search</button>
      </form>
      {error && <div>{error}</div>}
      {response && (
        <div>
          <h2>Results</h2>
          <ul>
            {response.map((result) => (
              <li key={result.id}>{result.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showSignupPage, setShowSignupPage] = useState(false);
  
  const handleLogin = (token) => {
  setToken(token);
  };
  
  const handleLogout = () => {
  localStorage.removeItem('token');
  setToken(null);
  };
  
  const handleSignupClick = () => {
  setShowSignupPage(true);
  };
  
  const handleBackToLogin = () => {
  setShowSignupPage(false);
  };
  
  // Check if the user is already logged in
  React.useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
  const decodedToken = jwtDecode(token);
  if (decodedToken.exp * 1000 < Date.now()) {
  handleLogout();
  } else {
  setToken(token);
  }
  }
  }, []);
  
  return (
  <div>
  {token ? (
  <SearchPage token={token} handleLogout={handleLogout} />
  ) : showSignupPage ? (
  <SignupPage onSignup={() => setToken(localStorage.getItem('token'))} onBackToLogin={handleBackToLogin} />
  ) : (
  <LoginPage onLogin={handleLogin} onSignupClick={handleSignupClick} />
  )}
  </div>
  );
  };
  
  export default App;
