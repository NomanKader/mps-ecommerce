import bcrypt from 'bcryptjs';

export const hashPassword = async (value: string): Promise<string> => bcrypt.hash(value, 12);

export const comparePassword = async (plain: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(plain, hashed);
