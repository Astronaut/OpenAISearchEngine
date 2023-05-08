// SignupPage.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const SignupPage = ({ onSignup, onBackToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Check if navigator.userAgentData is supported
    if (navigator.userAgentData) {
      const uaData = navigator.userAgentData;

      // Get the platform (e.g. Windows, macOS, Linux)
      const platform = uaData.platform;

      // Get the architecture (e.g. Intel x86, ARM)
      const architecture = uaData.platformArch;

      // Get the device brand (e.g. Apple, Samsung, Google)
      const brand = uaData.brands[0].brand;

      // Get the device model (e.g. iPhone 12, Galaxy S21, Pixel 5)
      const model = uaData.brands[0].model;

      // Log the information
      console.log(`Platform: ${platform}`);
      console.log(`Architecture: ${architecture}`);
      console.log(`Brand: ${brand}`);
      console.log(`Model: ${model}`);
    } else {
      console.log('navigator.userAgentData is not supported');
    }

    try {
      const response = await axios.post(`${API_URL}/register`, {
        fullName,
        email,
        username,
        password,
      });
      setError('');
      onSignup();
    } catch (err) {
      setError('Failed to create account');
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      {error && <div>{error}</div>}
      <form onSubmit={handleSignup}>
        <div>
          <label>Full Name:</label>
          <input type="text" value={fullName} onChange={handleFullNameChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="text" value={email} onChange={handleEmailChange} />
        </div>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={handleUsernameChange} autoComplete="username" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} autoComplete="current-password" />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <button onClick={onBackToLogin}>Back to Login</button>
    </div>
  );
};

export default SignupPage;
