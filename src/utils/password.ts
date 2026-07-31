import bcrypt from "bcrypt";

// [CONFIG] Salt rounds
const SALT_ROUNDS = 10;

// [AUTH] Hash password
export const hashPassword = (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// [AUTH] Compare plain and hashed password
export const comparePassword = (
  plainPassword: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};