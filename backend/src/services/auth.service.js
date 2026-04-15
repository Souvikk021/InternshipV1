const prisma = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper: store refresh token safely (upsert avoids unique constraint in fast test runs)
const storeRefreshToken = async (token, userId) => {
  await prisma.refreshToken.upsert({
    where: { token },
    update: { expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS) },
    create: {
      token,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  });
};

/**
 * Register a new user
 */
const registerUser = async (email, password) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email is already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await storeRefreshToken(refreshToken, user.id);
  return { user, accessToken, refreshToken };
};

/**
 * Login an existing user
 */
const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await storeRefreshToken(refreshToken, user.id);

  const safeUser = { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  return { user: safeUser, accessToken, refreshToken };
};

/**
 * Rotate refresh token (refresh token rotation pattern)
 */
const refreshTokens = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error('Refresh token not found or expired');
    err.statusCode = 401;
    throw err;
  }

  // Rotate: delete old token
  await prisma.refreshToken.delete({ where: { token } });

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(refreshToken, user.id);
  return { accessToken, refreshToken };
};

/**
 * Logout: Revoke the refresh token
 */
const logoutUser = async (token) => {
  if (!token) return;
  await prisma.refreshToken.deleteMany({ where: { token } });
};

module.exports = { registerUser, loginUser, refreshTokens, logoutUser };
