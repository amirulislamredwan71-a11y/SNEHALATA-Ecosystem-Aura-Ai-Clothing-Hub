export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'BLOCKED';

export interface Vendor {
  id: number;
  name: string;
  slug: string; // e.g., "shafis-fashion"
  websiteUrl?: string;
  tradeLicense?: string;
  status: VendorStatus;
  description: string;
}

export interface Product {
  id: number;
  vendorId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  externalUrl?: string; // Link to vendor's own website
  category: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  generatedImageUrl?: string;
  imagePrompt?: string; // Store the prompt used to generate the image
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'QUALITY_CHECK' | 'SHIPPED' | 'DELIVERED';

export interface OrderTimeline {
  status: OrderStatus;
  label: string;
  timestamp: string;
  completed: boolean;
  description: string;
}

export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  items: Product[];
  currentStatus: OrderStatus;
  estimatedDelivery: string;
  timeline: OrderTimeline[];
}

export interface EcosystemStats {
    totalVendors: number;
    activeProducts: number;
    monthlyVolume: number;
    aiInteractions: number;
    trendForecast: {
        year: string;
        trend: string;
        growth: number;
    }[];
}

export type AuditStatus = 'PASSED' | 'WARNING' | 'FAILED' | 'RE-AUDITING';

export interface AuditEntry {
  id: string;
  type: 'IMAGE_QUALITY' | 'PRICING_ETHICS' | 'AUTHENTICITY' | 'COPYWRITING' | 'LEGAL_COMPLIANCE' | 'SUSTAINABILITY';
  status: AuditStatus;
  timestamp: string;
  label: string;
  details: string;
}