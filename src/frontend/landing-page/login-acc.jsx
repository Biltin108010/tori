import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import supabase from '../../backend/supabaseClient';
import './landing-page.css';
import { useUser } from '../../backend/UserContext';

function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useUser(); // Access the user from UserContext
  const navigate = useNavigate();

  // Redirect the user if logged in
  useEffect(() => {
    if (user) {
      handleRedirectAfterLogin(user);
    }
  }, [user]);

  const handleRedirectAfterLogin = async (user) => {
    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('plan')
        .eq('email', user.email)
        .single();

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        setErrorMessage('Unable to fetch user profile. Please try again.');
        return;
      }

      if (!userData.plan) {
        navigate('/choose-ur-plan');
      } else {
        navigate('/seller/home');
      }
    } catch (err) {
      console.error('Redirect error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setErrorMessage(loginError.message);
        return;
      }

      // Redirect will be handled by the useEffect when the user context updates
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        setErrorMessage('Google sign-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="wrapper">
      <div className="logo">
        <img src="/images/tori_logo2.png" alt="Logo" width={68} height={68} />
      </div>
      <h1 className="signintitle">Sign In</h1>
      <div className="container">
        <div>
          <label htmlFor="email" className="label">Email Address</label>
          <input
            id="email"
            type="email"
            className="signininput-field"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="input-container">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="signininput-field password-input"
              placeholder="Must be 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div style={{ textAlign: 'right' }}>
          <Link to="#" className="forgotpasslink">Forgot password?</Link>
        </div>
        <button className="button button-primary" onClick={handleLogin}>
          Log in
        </button>

        <div className="or-login-with">
          <div className="divider">
            <span className="divider-text">Or Login with</span>
          </div>
          <div className="social-icons">
            <div className="social-icon google" onClick={handleGoogleLogin}>
              <i className="fab fa-google"></i>
            </div>
          </div>
        </div>

        <div className="signuptext">
          Don't have an account?{' '}
          <Link to="/register" className="signuplink">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignInForm;
