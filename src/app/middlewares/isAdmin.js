import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import User from '../models/User';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    const isAdm = await User.findOne({
      where: { email: 'admin@fastfeet.com' },
    });

    if (isAdm) {
      return res.status(401).json({ error: 'Only admin can do this' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  return next();
};
