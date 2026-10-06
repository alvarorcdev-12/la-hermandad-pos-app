export interface User {
  id: string;
  storeName: string;
  name: string;
  firstName: string;
  lastName: string | null;
  initials: string[];
  avatar: string | null;
  email: string;
  isActive: boolean;
  isShopOwner: boolean;
  phone: string | null;
  role: string;
  createdAt: Date;
}
