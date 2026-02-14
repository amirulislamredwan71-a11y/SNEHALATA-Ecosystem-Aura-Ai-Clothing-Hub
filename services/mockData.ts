import { Product, Vendor, Order, EcosystemStats } from '../types';

// --- PERSISTENCE LAYER (Acting as Database) ---
const loadFromDB = <T>(key: string): T[] => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch {
        return [];
    }
};

const saveToDB = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- INITIAL SEED DATA ---
const INITIAL_VENDORS: Vendor[] = [
  {
    id: 1,
    name: "Royal Bengal Looms (রয়েল বেঙ্গল লুমস)",
    slug: "royal-bengal-looms",
    websiteUrl: "https://example.com/royal-bengal",
    status: "APPROVED",
    description: "ঐতিহ্যবাহী জামদানি এবং মসলিন তাঁতশিল্পের গৌরব। Heritage weavers of Bangladesh.",
    tradeLicense: "TRD-2024-8899"
  },
  {
    id: 2,
    name: "Urban Dhaka Streetwear (আরবান ঢাকা)",
    slug: "urban-dhaka",
    websiteUrl: "https://example.com/urban-dhaka",
    status: "APPROVED",
    description: "Gen Z-এর জন্য মডার্ন ওভারসাইজ টি-শার্ট এবং হুডি।",
    tradeLicense: "TRD-2024-1122"
  },
  {
    id: 3,
    name: "Shadow Market",
    slug: "shadow-market",
    status: "BLOCKED",
    description: "Unverified seller detected by Aura Governance.",
    tradeLicense: "INVALID"
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 101,
    vendorId: 1,
    name: "Midnight Black জামদানি শাড়ি",
    price: 15500,
    description: "হাতে বোনা ১০০ কাউন্ট সুতার সাথে গোল্ড জড়ি কাজ। A masterpiece of Dhakai Jamdani.",
    imageUrl: "https://images.unsplash.com/photo-1610189012906-4783fda36799?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://example.com/royal-bengal/p/jamdani-black",
    category: "Saree"
  },
  {
    id: 102,
    vendorId: 1,
    name: "Heritage মসলিন পাঞ্জাবি",
    price: 8500,
    description: "রাজকীয় উৎসবের জন্য অথেনটিক ঢাকাই মসলিন।",
    imageUrl: "https://images.unsplash.com/photo-1631640989396-b1836a04e386?q=80&w=800&auto=format&fit=crop",
    category: "Panjabi"
  },
  {
    id: 201,
    vendorId: 2,
    name: "Neon Cyberpunk Hoodie",
    price: 2200,
    description: "হেভিওয়েট কটন ফ্লিস এবং পাফ প্রিন্ট ডিজাইন।",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://example.com/urban-dhaka/p/neon-hoodie",
    category: "Hoodie"
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-5001",
    customerName: "Rahim Ahmed",
    totalAmount: 17700,
    items: [INITIAL_PRODUCTS[0], INITIAL_PRODUCTS[2]],
    currentStatus: "SHIPPED",
    estimatedDelivery: "24 Feb, 2025",
    timeline: [
      { status: 'PLACED', label: 'অর্ডার প্লেস করা হয়েছে', timestamp: '20 Feb, 10:00 AM', completed: true, description: "Customer placed order via Aura Hub" },
      { status: 'CONFIRMED', label: 'ভেন্ডর কনফার্মেশন', timestamp: '20 Feb, 10:30 AM', completed: true, description: "Royal Bengal Looms accepted the request" },
      { status: 'QUALITY_CHECK', label: 'Aura কোয়ালিটি চেক', timestamp: '21 Feb, 02:15 PM', completed: true, description: "Passes Aura Governance Standards (Thread Count: 100)" },
      { status: 'SHIPPED', label: 'শিপিং-এর জন্য প্রস্তুত', timestamp: '22 Feb, 09:00 AM', completed: true, description: "Handed over to Pathao Courier" },
      { status: 'DELIVERED', label: 'ডেলিভারি সম্পন্ন', timestamp: '-', completed: false, description: "Estimated: 24 Feb" },
    ]
  }
];

export const MOCK_STATS: EcosystemStats = {
    totalVendors: 1250,
    activeProducts: 45000,
    monthlyVolume: 8500000,
    aiInteractions: 120000,
    trendForecast: [
        { year: "2025", trend: "Hyper-Local Craft Revival", growth: 45 },
        { year: "2026", trend: "AR/VR Shopping Standard", growth: 120 },
        { year: "2027", trend: "Carbon Neutral Logistics", growth: 85 },
        { year: "2028", trend: "Aura Automated Supply Chain", growth: 200 }
    ]
};

// --- DATA ACCESS LAYER (API) ---

export const getVendors = (): Vendor[] => {
    const dbVendors = loadFromDB<Vendor>('aura_vendors');
    const combined = [...INITIAL_VENDORS, ...dbVendors];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
};

export const addVendor = (vendor: Vendor) => {
    const vendors = getVendors();
    if (!vendors.find(v => v.id === vendor.id)) {
        const dbVendors = loadFromDB<Vendor>('aura_vendors');
        dbVendors.push(vendor);
        saveToDB('aura_vendors', dbVendors);
        
        // Auto-generate a starter product
        const starterProduct: Product = {
            id: Date.now() + 999,
            vendorId: vendor.id,
            name: `${vendor.name} Starter Item`,
            price: 1500,
            description: `Signature item from the newly joined ${vendor.name} collection.`,
            imageUrl: `https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop`,
            category: "New Arrival"
        };
        addProduct(starterProduct);
    }
};

export const getProducts = (): Product[] => {
    const dbProducts = loadFromDB<Product>('aura_products');
    const combined = [...INITIAL_PRODUCTS, ...dbProducts];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
};

export const addProduct = (product: Product) => {
    const dbProducts = loadFromDB<Product>('aura_products');
    dbProducts.unshift(product);
    saveToDB('aura_products', dbProducts);
    // Trigger Real-time Update
    window.dispatchEvent(new Event('productUpdated'));
};

export const deleteProduct = (productId: number) => {
    let dbProducts = loadFromDB<Product>('aura_products');
    dbProducts = dbProducts.filter(p => p.id !== productId);
    saveToDB('aura_products', dbProducts);
    // Note: Cannot delete initial products, only user added ones in this mock
    window.dispatchEvent(new Event('productUpdated'));
}

export const getOrders = (): Order[] => {
    const dbOrders = loadFromDB<Order>('aura_orders');
    const combined = [...dbOrders, ...INITIAL_ORDERS];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
};

export const addOrder = (order: Order) => {
    const dbOrders = loadFromDB<Order>('aura_orders');
    dbOrders.unshift(order);
    saveToDB('aura_orders', dbOrders);
    window.dispatchEvent(new Event('orderUpdated'));
};

export const getOrderById = (orderId: string): Order | undefined => {
    return getOrders().find(o => o.id === orderId);
};

export const getVendorBySlug = (slug: string) => getVendors().find(v => v.slug === slug);
export const getProductsByVendor = (vendorId: number) => getProducts().filter(p => p.vendorId === vendorId);
export const getEcosystemStats = () => MOCK_STATS;
export const getLiveSales = () => 2540000;