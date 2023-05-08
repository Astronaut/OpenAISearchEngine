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
    <input type="text" value={username} onChange={handleUsernameChange} />
    </div>
    <div>
    <label>Password:</label>
    <input type="password" value={password} onChange={handlePasswordChange} />
    </div>
    <button type="submit">Login</button>
    </form>
    <button onClick={onSignupClick}>Sign Up</button>
    {onBackToLogin && (
    <button onClick={onBackToLogin}>Back to Login</button>
    )}
    </div>
    );
    };
    
    export default LoginPage;