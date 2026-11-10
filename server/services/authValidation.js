function validateRegistration({ name, email, password }) {
  if (!name || !name.trim()) return 'Please enter your name.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email.';
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  return null; // null means everything is valid
}

module.exports = { validateRegistration };