import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta';

export const generateToken = (payload: object, expiresIn = '1h') => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};
