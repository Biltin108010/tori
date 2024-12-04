import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../backend/supabaseClient'; // Import Supabase client
import { Eye, EyeOff } from 'lucide-react';
import './landing-page.css'; // Ensure the styling is included


const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seller'); // Default to seller role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user in Supabase Auth
      const { user, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Insert user data into 'users' table without providing the 'id'
      const { data, error: dbError } = await supabase
        .from('users')
        .insert([{ username, email, role }]);

      if (dbError) {
        throw new Error(dbError.message);
      }

      alert('Signup successful!');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        {/* Logo */}
        <div className="logo">
          <img
            src="https://res.cloudinary.com/dcd5cnr4m/image/upload/v1733254195/Untitled_design_7_td7pot.png"
            alt="Logo"
            width={68}
            height={68}
            className="dark:invert"
          />
        </div>

        {/* Heading */}
        <h1 className="signintitle">Sign Up</h1>

        {/* Form */}
        <form className="form" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="enter your username"
              required
              className="input-field"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="input-field"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="label">
              Create a password
            </label>
            <div className="input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="must be 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field password-input"
              />
              <button
                type="button"
                className="signupeye-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="label">
              Confirm password
            </label>
            <div className="input-container">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="repeat password"
                required
                className="input-field password-input"
              />
              <button
                type="button"
                className="signupeye-button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Role Input */}
          <div>
            <label htmlFor="role" className="label">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="admin">Admin</option>
              <option value="coadmin">Co-admin</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Signing up...' : 'Create Account'}
          </button>
        </form>

        {/* Or Register with section */}
        <div className="or-login-with">
          <div className="divider">
            <span className="divider-text">Or Register with</span>
          </div>
          <div className="social-icons">
            <div className="social-icon google">
              <i className="fab fa-google"></i>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="error-message">{error}</div>}

        {/* Existing Account */}
        <div className="already-account">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
