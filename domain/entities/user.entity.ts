export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string | null;
  initials: string[];
  avatar: string | null;
  email: string | null;
  isActive: boolean;
  isShopOwner: boolean;
  phone: string | null;
  role: string;
  createdAt: Date;
}
