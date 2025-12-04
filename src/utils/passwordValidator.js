export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  // Check length
  if (password.length < 8) {
    errors.push('Use at least 8 characters');
  }
  if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Add at least 1 uppercase letter (A-Z)');
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Add at least 1 lowercase letter (a-z)');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Add at least 1 number (0-9)');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Add at least 1 special character (!@#$%^&* etc)');
  }

  // Check for common weak patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Avoid repeating the same character more than twice');
  }

  // Check for sequential characters
  if (/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    errors.push('Avoid sequential characters (123, abc, etc)');
  }

  // Check against common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty123',
    'admin', 'admin123', 'welcome', 'letmein',
    'monkey', 'dragon', 'master', 'sunshine',
    'aaaaaa', 'baseball', 'football', 'baseball'
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Choose a more unique password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getPasswordRequirements = () => {
  return [
    { label: 'At least 8 characters', key: 'length' },
    { label: '1 uppercase letter (A-Z)', key: 'uppercase' },
    { label: '1 number (0-9)', key: 'number' },
    { label: '1 special character (!@#$%)', key: 'special' },
  ];
};

export const checkPasswordRequirements = (password) => {
  if (!password) {
    return {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
      noRepeat: true,
      noSequential: true,
      notCommon: true,
    };
  }

  return {
    length: password.length >= 8 && password.length <= 128,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noRepeat: !/(.)\1{2,}/.test(password),
    noSequential: !/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password),
    notCommon: !['password', 'password123', '12345678', 'qwerty123', 'admin', 'admin123', 'welcome', 'letmein', 'monkey', 'dragon', 'master', 'sunshine', 'aaaaaa', 'baseball', 'football'].includes(password.toLowerCase()),
  };
};
