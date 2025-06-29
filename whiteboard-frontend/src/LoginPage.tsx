import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

interface LoginFormData {
  username: string;
  roomId: string;
  roomPassword: string;
  token: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    roomId: '',
    roomPassword: '',
    token: ''
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form with URL parameters if available
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setFormData({
      username: urlParams.get('username') || '',
      roomId: urlParams.get('roomId') || '',
      roomPassword: urlParams.get('roomPassword') || '',
      token: urlParams.get('token') || ''
    });
  }, [location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }
    
    if (!formData.roomId.trim()) {
      newErrors.roomId = 'Room ID is required';
    } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.roomId.trim())) {
      newErrors.roomId = 'Room ID can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!formData.roomPassword.trim()) {
      newErrors.roomPassword = 'Room password is required';
    } else if (formData.roomPassword.trim().length < 4) {
      newErrors.roomPassword = 'Room password must be at least 4 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!formData.token.trim()) {
      alert('Please authenticate with room credentials first by clicking the "Authenticate" button.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Optional: Test connection to backend before proceeding
      await fetch('http://localhost:5959/test', {
        method: 'HEAD',
        mode: 'no-cors'
      }).catch(() => null);
      
      // Navigate to whiteboard with parameters
      const params = new URLSearchParams({
        username: formData.username.trim(),
        roomId: formData.roomId.trim(),
        token: formData.token.trim()
      });
      
      navigate(`/whiteboard?${params.toString()}`);
    } catch (error) {
      console.error('Connection test failed:', error);
      // Still proceed to whiteboard - connection errors will be handled there
      const params = new URLSearchParams({
        username: formData.username.trim(),
        roomId: formData.roomId.trim(),
        token: formData.token.trim()
      });
      
      navigate(`/whiteboard?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoomId = () => {
    const randomId = `room-${Math.random().toString(36).substring(2, 10)}`;
    setFormData(prev => ({
      ...prev,
      roomId: randomId
    }));
  };

  const authenticateWithRoom = async () => {
    if (!formData.roomId.trim() || !formData.roomPassword.trim()) {
      alert('Please enter both Room ID and Room Password first');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call backend to authenticate with room credentials
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5959'}/auth/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username || `user_${Math.random().toString(36).substring(2, 8)}`,
          roomId: formData.roomId.trim(),
          roomPassword: formData.roomPassword.trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        token: data.token
      }));
      
      console.log('Room authentication successful:', data.payload);
      alert('Authentication successful! You can now join the whiteboard.');
    } catch (error) {
      console.error('Room authentication failed:', error);
      alert(`Authentication failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Join Whiteboard</h1>
          <p>Enter your details to join or create a collaborative whiteboard session</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className={errors.username ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <div className="input-with-button">
              <input
                type="text"
                id="roomId"
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                placeholder="Enter room ID or generate one"
                className={errors.roomId ? 'error' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={generateRoomId}
                className="generate-btn"
                disabled={isLoading}
              >
                Generate
              </button>
            </div>
            {errors.roomId && <span className="error-message">{errors.roomId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="roomPassword">Room Password</label>
            <input
              type="password"
              id="roomPassword"
              name="roomPassword"
              value={formData.roomPassword}
              onChange={handleInputChange}
              placeholder="Enter room password"
              className={errors.roomPassword ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.roomPassword && <span className="error-message">{errors.roomPassword}</span>}
            <small className="help-text">
              Set a password for new rooms, or enter the existing password for existing rooms
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="token">Authentication Token</label>
            <div className="input-with-button">
              <input
                type="password"
                id="token"
                name="token"
                value={formData.token}
                onChange={handleInputChange}
                placeholder="Enter your authentication token"
                className={errors.token ? 'error' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={authenticateWithRoom}
                className="generate-btn"
                disabled={isLoading}
                title="Authenticate with room credentials"
              >
                Authenticate
              </button>
            </div>
            {errors.token && <span className="error-message">{errors.token}</span>}
            <small className="help-text">
              Contact your administrator for a valid authentication token
            </small>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Join Whiteboard'}
          </button>
        </form>

        <div className="login-footer">
          <div className="tips">
            <h4>Tips:</h4>
            <ul>
              <li>Share the Room ID with others to collaborate</li>
              <li>Use the same token that others in your room are using</li>
              <li>Your username will be visible to other participants</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
