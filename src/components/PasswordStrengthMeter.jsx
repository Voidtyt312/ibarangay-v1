import { checkPasswordRequirements } from '../utils/passwordValidator.js';
import '../css/PasswordStrengthMeter.css';

function PasswordStrengthMeter({ password }) {
  if (!password) {
    return null;
  }

  const requirements = checkPasswordRequirements(password);
  
  // Count met requirements
  const metRequirements = Object.values(requirements).filter(v => v).length;
  const totalRequirements = Object.keys(requirements).length;
  const strengthPercentage = (metRequirements / totalRequirements) * 100;

  // Determine strength level
  let strength = 'weak';
  let strengthColor = '#dc2626';
  
  if (strengthPercentage >= 85) {
    strength = 'strong';
    strengthColor = '#10b981';
  } else if (strengthPercentage >= 60) {
    strength = 'fair';
    strengthColor = '#f59e0b';
  } else if (strengthPercentage >= 40) {
    strength = 'moderate';
    strengthColor = '#f59e0b';
  }

  return (
    <div className="password-strength-meter">
      <div className="strength-bar-container">
        <div 
          className="strength-bar"
          style={{ 
            width: `${strengthPercentage}%`,
            backgroundColor: strengthColor
          }}
          role="progressbar"
          aria-valuenow={strengthPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Password strength"
        />
      </div>
      <p className="strength-text" style={{ color: strengthColor }}>
        Strength: <span className="strength-level">{strength}</span>
      </p>
      <p className="strength-hint">
        {metRequirements} of {totalRequirements} requirements met
      </p>
    </div>
  );
}

export default PasswordStrengthMeter;
