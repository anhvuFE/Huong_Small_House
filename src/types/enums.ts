export type ProductCategory =
  | 'VITAMIN'
  | 'COLLAGEN'
  | 'BONE_SUPPORT'
  | 'WEIGHT_LOSS'
  | 'IMMUNITY'
  | 'DIGESTIVE'
  | 'HEART_HEALTH'
  | 'BEAUTY'
  | 'ENERGY'
  | 'SLEEP';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'E_WALLET'
  | 'CREDIT_CARD';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export type ProductUnit = 'BOTTLE' | 'BOX' | 'PACK' | 'TUBE' | 'JAR';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
