import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'supersecretjwtkey12345!';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};
