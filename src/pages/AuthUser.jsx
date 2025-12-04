import { useState, useEffect } from 'react';
import Logo from '../assets/LOGO.png';
import { loginUser, registerUser, adminLogin, getBarangays } from '../services/api.js';
import { validatePassword, checkPasswordRequirements } from '../utils/passwordValidator.js';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx';
import ForgotPasswordModal from '../components/ForgotPasswordModal.jsx';
import ResetPasswordModal from '../components/ResetPasswordModal.jsx';
import '../css/AuthUser.css';

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="#0f172a" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="#0f172a" strokeWidth="1.8" />
      <line x1="4" y1="20" x2="20" y2="4" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthUser({ onBackHome, onLoginSuccess, userType = 'user' }) {
  const isAdmin = userType === 'admin';
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [registerForm, setRegisterForm] = useState(
    isAdmin
      ? {
          officialEmail: '',
          barangayName: '',
          municipality: '',
          province: '',
          contact: '',
          password: '',
          confirmPassword: '',
          terms: false,
        }
      : {
           firstName: '',
           lastName: '',
           email: '',
           phone: '',
           barangayName: '',
           municipality: '',
           province: '',
           password: '',
           confirmPassword: '',
           terms: false,
         }
  );
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [allBarangays, setAllBarangays] = useState([]);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    noRepeat: true,
    noSequential: true,
    notCommon: true,
  });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    fetchBarangays();
  }, [isAdmin]);

  const fetchBarangays = async () => {
    try {
      const response = await getBarangays();
      console.log('✓ Barangays fetched:', response.data);
      setAllBarangays(response.data);
    } catch (error) {
      console.error('Failed to fetch barangays:', error);
    }
  };

  const handleFlip = (targetMode) => {
    setMode(targetMode);
    if (targetMode === 'login') {
      setRegisterErrors({});
    } else {
      setLoginErrors({});
    }
  };

  const handleLoginChange = (event) => {
    const { name, value, type, checked } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (name === 'password') {
      setPasswordRequirements(checkPasswordRequirements(value));
    }
  };

  const validateLogin = () => {
    const errors = {};
    if (!loginForm.email) errors.email = 'Email is required';
    else if (!emailPattern.test(loginForm.email)) errors.email = 'Enter a valid email';
    if (!loginForm.password) errors.password = 'Password is required';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = () => {
    const errors = {};
    if (isAdmin) {
      if (!registerForm.officialEmail) errors.officialEmail = 'Official email is required';
      else if (!emailPattern.test(registerForm.officialEmail)) errors.officialEmail = 'Enter a valid email';
      if (!registerForm.barangayName) errors.barangayName = 'Barangay name is required';
      if (!registerForm.municipality) errors.municipality = 'Municipality is required';
      if (!registerForm.province) errors.province = 'Province is required';
      if (!registerForm.contact) errors.contact = 'Contact number is required';
    } else {
      if (!registerForm.firstName) errors.firstName = 'First name is required';
      if (!registerForm.lastName) errors.lastName = 'Last name is required';
      if (!registerForm.email) errors.email = 'Email is required';
      else if (!emailPattern.test(registerForm.email)) errors.email = 'Enter a valid email';
      if (!registerForm.phone) errors.phone = 'Phone number is required';
      if (!registerForm.barangayName) errors.barangayName = 'Barangay name is required';
      if (!registerForm.municipality) errors.municipality = 'Municipality is required';
      if (!registerForm.province) errors.province = 'Province is required';
    }
    
    const passwordValidation = validatePassword(registerForm.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(', ');
    }
    
    if (!registerForm.confirmPassword) errors.confirmPassword = 'Confirm your password';
    else if (registerForm.confirmPassword !== registerForm.password) errors.confirmPassword = 'Passwords do not match';
    if (!registerForm.terms) errors.terms = 'Please accept the terms';
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setGeneralError('');
    
    if (validateLogin()) {
      try {
        setLoading(true);
        
        const loginData = {
          email: loginForm.email,
          password: loginForm.password
        };

        let response;
        if (isAdmin) {
          response = await adminLogin(loginData);
        } else {
          response = await loginUser(loginData);
        }

        if (response.data.success) {
          // Store user info in localStorage
          const userData = response.data.user;
          localStorage.setItem('userId', userData.userId);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userType', userData.userType);
          localStorage.setItem('barangayId', userData.barangayId || '');
          localStorage.setItem('fullName', userData.fullName || '');
          
          // Store user data for profile/dashboard syncing
          localStorage.setItem('userData', JSON.stringify({
            userId: userData.userId,
            email: userData.email,
            fullName: userData.fullName,
            barangayId: userData.barangayId,
            userType: userData.userType
          }));

          // Redirect to appropriate dashboard
          if (userData.userType === 'superadmin') {
            onLoginSuccess?.('superadmin');
          } else {
            onLoginSuccess?.();
          }
        }
      } catch (error) {
        setGeneralError(error.response?.data?.error || 'Login failed. Please try again.');
        console.error('Login error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegisterSubmit = async (event) => {
     event.preventDefault();
     setGeneralError('');
     
     if (validateRegister()) {
       try {
         setLoading(true);

         let barangayId = null;

         // Fetch all barangays if not already done
         if (allBarangays.length === 0) {
           await fetchBarangays();
         }

         // Find matching barangay (case-insensitive, trim whitespace)
         const barangayName = isAdmin ? registerForm.barangayName : registerForm.barangayName;
         const municipality = isAdmin ? registerForm.municipality : registerForm.municipality;
         const province = isAdmin ? registerForm.province : registerForm.province;

         console.log('🔍 Searching for barangay:');
         console.log('  Name:', barangayName);
         console.log('  Municipality:', municipality);
         console.log('  Province:', province);
         console.log('  Available barangays:', allBarangays.length);

         const matchedBarangay = allBarangays.find(
           (b) => {
             const nameMatch = (b.BarangayName || '').toLowerCase().trim() === barangayName.toLowerCase().trim();
             const munMatch = (b.Municipality || '').toLowerCase().trim() === municipality.toLowerCase().trim();
             const provMatch = (b.Province || '').toLowerCase().trim() === province.toLowerCase().trim();
             
             if (nameMatch && munMatch && provMatch) {
               console.log('✓ Match found:', b);
             }
             
             return nameMatch && munMatch && provMatch;
           }
         );

         if (!matchedBarangay) {
           console.log('❌ No matching barangay found');
           console.log('First few barangays:', allBarangays.slice(0, 3));
           setGeneralError(`Barangay not found. Please verify the barangay name, municipality, and province match our records.`);
           setLoading(false);
           return;
         }

         barangayId = matchedBarangay.BarangayID;

         if (isAdmin) {
           // Register as admin - insert into officials table
           const adminData = {
             email: registerForm.officialEmail,
             contactNumber: registerForm.contact,
             password: registerForm.password,
             barangayId: barangayId,
           };

           const response = await fetch('http://localhost:3001/api/admin-register', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(adminData)
           });

           if (!response.ok) {
             const error = await response.json();
             throw new Error(error.error || 'Admin registration failed');
           }

           const data = await response.json();
           alert('Application submitted successfully! Awaiting admin approval.');
           setLoginForm((prev) => ({ ...prev, email: registerForm.officialEmail, password: '' }));
           handleFlip('login');
         } else {
           // Register as user
           const registerData = {
             fullName: `${registerForm.firstName} ${registerForm.lastName}`,
             email: registerForm.email,
             password: registerForm.password,
             phone: registerForm.phone,
             barangayId: barangayId,
           };

           const response = await registerUser(registerData);

           if (response.data.success) {
             setLoginForm((prev) => ({ ...prev, email: registerForm.email, password: '' }));
             alert('Registration successful! Please log in with your credentials.');
             handleFlip('login');
           }
         }
       } catch (error) {
         const errorData = error.response?.data;
         if (errorData?.details && Array.isArray(errorData.details)) {
           // Show detailed password validation errors
           setRegisterErrors({ password: errorData.details.join(', ') });
           setGeneralError('Password does not meet security requirements. See details above.');
         } else {
           setGeneralError(errorData?.error || error.message || 'Registration failed. Please try again.');
         }
         console.error('Register error:', error);
       } finally {
         setLoading(false);
       }
       }
       };

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <img src={Logo} alt="iBarangay logo" />
        <p className="panel-eyebrow">{isAdmin ? 'Admin Portal' : 'Community Platform'}</p>
        <h1>{isAdmin ? 'Sign in to access the admin dashboard' : 'Welcome back to iBarangay'}</h1>
        <p className="panel-copy">
          {isAdmin
            ? 'Administrators can manage requests, verify residents, and publish official announcements.'
            : 'Manage documents, send announcements, and keep every resident informed through one secure portal made for local leaders.'}
        </p>
        <ul className="panel-list">
          {isAdmin ? (
            <>
              <li>Admin-only dashboards and controls</li>
              <li>Approve requests and manage releases</li>
              <li>Secure role-based access</li>
            </>
          ) : (
            <>
              <li>Secure resident authentication</li>
              <li>Step-by-step request tracking</li>
              <li>Automated reminders and alerts</li>
            </>
          )}
        </ul>
      </section>

      <div className={`auth-card ${mode === 'register' ? 'is-flipped' : ''}`}>
        <div className="card-face card-face--front" aria-hidden={mode !== 'login'}>
          <button className="back-link" type="button" onClick={onBackHome}>
            ← Back to home
          </button>
          <h2>{isAdmin ? 'Admin Login' : 'Login'}</h2>
          <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
            <label>
              Email
              <input
                className={`text-input ${loginErrors.email ? 'invalid' : ''}`}
                type="email"
                name="email"
                placeholder={isAdmin ? 'admin@barangay.ph' : 'your.email@example.com'}
                value={loginForm.email}
                onChange={handleLoginChange}
              />
              {loginErrors.email && <span className="error-text">{loginErrors.email}</span>}
            </label>

            <label>
              Password
              <div className={`input-control ${loginErrors.password ? 'invalid' : ''}`}>
                <input
                  className="text-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showLoginPassword} />
                </button>
              </div>
              {loginErrors.password && <span className="error-text">{loginErrors.password}</span>}
            </label>

            <div className="auth-row">
              <label className="remember-me">
                <input type="checkbox" name="remember" checked={loginForm.remember} onChange={handleLoginChange} />
                Remember me
              </label>
              {!isAdmin && (
                <button 
                  type="button" 
                  className="forgot-link"
                  onClick={() => setShowForgotPasswordModal(true)}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {generalError && <div className="error-text" style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px', color: '#991b1b' }}>{generalError}</div>}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Loading...' : isAdmin ? 'Sign In as Admin' : 'Log In'}
            </button>
          </form>

          <p className="switch-text">
            {isAdmin ? (
              <>
                Need an admin account?{' '}
                <button type="button" onClick={() => handleFlip('register')}>
                  Register here
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => handleFlip('register')}>
                  Register
                </button>
              </>
            )}
          </p>
        </div>

        <div className="card-face card-face--back" aria-hidden={mode !== 'register'}>
          <button className="back-link" type="button" onClick={(onBackHome)}>
            ← Back to Home
          </button>
          <h2>{isAdmin ? 'Register as Admin' : 'Create Account'}</h2>
          <p className="helper-text">
            {isAdmin ? 'Apply for barangay administrator access' : 'Fill in your information to get started'}
          </p>
          <form className="register-scroll" onSubmit={handleRegisterSubmit} noValidate>
            {isAdmin ? (
              <>
                <label>
                  Official Email
                  <input
                    className={`text-input ${registerErrors.officialEmail ? 'invalid' : ''}`}
                    type="email"
                    name="officialEmail"
                    placeholder="admin@barangay.gov.ph"
                    value={registerForm.officialEmail}
                    onChange={handleRegisterChange}
                  />
                  {registerErrors.officialEmail && <span className="error-text">{registerErrors.officialEmail}</span>}
                </label>

                <label>
                  Barangay Name
                  <input
                    className={`text-input ${registerErrors.barangayName ? 'invalid' : ''}`}
                    type="text"
                    name="barangayName"
                    placeholder="e.g., Consolacion"
                    value={registerForm.barangayName}
                    onChange={handleRegisterChange}
                  />
                  {registerErrors.barangayName && <span className="error-text">{registerErrors.barangayName}</span>}
                </label>

                <div className="two-col">
                  <label>
                    Municipality
                    <input
                      className={`text-input ${registerErrors.municipality ? 'invalid' : ''}`}
                      type="text"
                      name="municipality"
                      placeholder="e.g., Dalaguete"
                      value={registerForm.municipality}
                      onChange={handleRegisterChange}
                    />
                    {registerErrors.municipality && <span className="error-text">{registerErrors.municipality}</span>}
                  </label>
                  <label>
                    Province
                    <input
                      className={`text-input ${registerErrors.province ? 'invalid' : ''}`}
                      type="text"
                      name="province"
                      placeholder="e.g., Cebu"
                      value={registerForm.province}
                      onChange={handleRegisterChange}
                    />
                    {registerErrors.province && <span className="error-text">{registerErrors.province}</span>}
                  </label>
                </div>

                <label>
                  Contact Number
                  <input
                    className={`text-input ${registerErrors.contact ? 'invalid' : ''}`}
                    type="tel"
                    name="contact"
                    placeholder="+63 912 345 6789"
                    value={registerForm.contact}
                    onChange={handleRegisterChange}
                  />
                  {registerErrors.contact && <span className="error-text">{registerErrors.contact}</span>}
                </label>
              </>
            ) : (
              <>
                <div className="two-col">
                  <label>
                    First Name
                    <input
                      className={`text-input ${registerErrors.firstName ? 'invalid' : ''}`}
                      type="text"
                      name="firstName"
                      placeholder="Juan"
                      value={registerForm.firstName}
                      onChange={handleRegisterChange}
                    />
                    {registerErrors.firstName && <span className="error-text">{registerErrors.firstName}</span>}
                  </label>
                  <label>
                    Last Name
                    <input
                      className={`text-input ${registerErrors.lastName ? 'invalid' : ''}`}
                      type="text"
                      name="lastName"
                      placeholder="Dela Cruz"
                      value={registerForm.lastName}
                      onChange={handleRegisterChange}
                    />
                    {registerErrors.lastName && <span className="error-text">{registerErrors.lastName}</span>}
                  </label>
                </div>

                <label>
                  Email
                  <input
                    className={`text-input ${registerErrors.email ? 'invalid' : ''}`}
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                  />
                  {registerErrors.email && <span className="error-text">{registerErrors.email}</span>}
                </label>

                <label>
                  Phone Number
                  <input
                    className={`text-input ${registerErrors.phone ? 'invalid' : ''}`}
                    type="tel"
                    name="phone"
                    placeholder="+63 9123 456 7891"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                  />
                  {registerErrors.phone && <span className="error-text">{registerErrors.phone}</span>}
                </label>

                 <label>
                   Barangay Name
                   <input
                     className={`text-input ${registerErrors.barangayName ? 'invalid' : ''}`}
                     type="text"
                     name="barangayName"
                     placeholder="e.g., Consolacion"
                     value={registerForm.barangayName}
                     onChange={handleRegisterChange}
                   />
                   {registerErrors.barangayName && <span className="error-text">{registerErrors.barangayName}</span>}
                 </label>

                 <div className="two-col">
                   <label>
                     Municipality
                     <input
                       className={`text-input ${registerErrors.municipality ? 'invalid' : ''}`}
                       type="text"
                       name="municipality"
                       placeholder="e.g., Dalaguete"
                       value={registerForm.municipality}
                       onChange={handleRegisterChange}
                     />
                     {registerErrors.municipality && <span className="error-text">{registerErrors.municipality}</span>}
                   </label>
                   <label>
                     Province
                     <input
                       className={`text-input ${registerErrors.province ? 'invalid' : ''}`}
                       type="text"
                       name="province"
                       placeholder="e.g., Cebu"
                       value={registerForm.province}
                       onChange={handleRegisterChange}
                     />
                     {registerErrors.province && <span className="error-text">{registerErrors.province}</span>}
                   </label>
                 </div>
                </>
                )}

            <label>
              Password
              <div className={`input-control ${registerErrors.password ? 'invalid' : ''}`}>
                <input
                  className="text-input"
                  type={showRegisterPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showRegisterPassword} />
                </button>
                </div>
                {registerErrors.password && <span className="error-text">{registerErrors.password}</span>}
                <PasswordStrengthMeter password={registerForm.password} />
                
            </label>

            <label>
              Confirm Password
              <div className={`input-control ${registerErrors.confirmPassword ? 'invalid' : ''}`}>
                <input
                  className="text-input"
                  type={showRegisterConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowRegisterConfirm((prev) => !prev)}
                  aria-label={showRegisterConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showRegisterConfirm} />
                </button>
              </div>
              {registerErrors.confirmPassword && <span className="error-text">{registerErrors.confirmPassword}</span>}
            </label>

            <label className={`terms ${registerErrors.terms ? 'invalid' : ''}`}>
              <input type="checkbox" name="terms" checked={registerForm.terms} onChange={handleRegisterChange} />
              I agree to the Terms of Service and Privacy Policy
            </label>
            {registerErrors.terms && <span className="error-text">{registerErrors.terms}</span>}

            {generalError && <div className="error-text" style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px', color: '#991b1b' }}>{generalError}</div>}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Processing...' : isAdmin ? 'Submit Application' : 'Register'}
            </button>

            <p className="switch-text">
              {isAdmin ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => handleFlip('login')}>
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => handleFlip('login')}>
                    Log in
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSubmit={(email) => {
          setResetEmail(email);
          setShowResetPasswordModal(true);
        }}
      />

      <ResetPasswordModal 
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setResetEmail('');
        }}
        email={resetEmail}
        onSuccess={() => {
          setLoginForm((prev) => ({ ...prev, email: resetEmail, password: '' }));
        }}
      />
    </div>
  );
}

export default AuthUser;

