export interface AuthResponse {
  token: string;
  user: UserDB;
}

export interface UserDB {
  id: string;
  storeName: string;
  firstName: string;
  lastName: string | null;
  name: string;
  initials: string[];
  avatar: string | null;
  email: string;
  isActive: boolean;
  isShopOwner: boolean;
  phone: string | null;
  role: string;
  createdAt: Date;
}
