
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'default_secret', // Fallback to a default secret if not defined
};