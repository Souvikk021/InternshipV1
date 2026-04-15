const { registerUser, loginUser, refreshTokens, logoutUser } = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await registerUser(email, password);

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { user, accessToken }, 201, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser(email, password);

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { user, accessToken }, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    // Accept from cookie OR body (for easier testing)
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return sendError(res, 'Refresh token required', 401);
    }

    const { accessToken, refreshToken } = await refreshTokens(token);

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { accessToken }, 200, 'Tokens refreshed');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    await logoutUser(token);

    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    return sendSuccess(res, null, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 200, 'User info retrieved');
};

module.exports = { register, login, refresh, logout, me };
