export type User = {
  id: string;
  email: string;
  name: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

