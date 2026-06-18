const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(errorData.message || 'An error occurred while fetching data');
  }

  return response.json();
}

// Auth
export const loginApi = (data: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) });

// Ingredients
export const getIngredients = () => fetchAPI('/ingredients');
export const createIngredient = (data: { name: string; unit: string; stock: number; minStock: number }) => 
  fetchAPI('/ingredients', { method: 'POST', body: JSON.stringify(data) });

// Products
export const getProducts = () => fetchAPI('/products');
export const createProduct = (data: { name: string; price: number; category: string; recipeItems?: { ingredientId: number, quantity: number }[] }) => 
  fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) });

// Orders
export const createOrder = (data: { userId: number; branchId: number; items: { productId: number; quantity: number }[] }) => 
  fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) });
export const getOrders = () => fetchAPI('/orders');

// Procurement & Branches
export const getPurchaseOrders = () => fetchAPI('/purchase-orders');
export const getSuppliers = () => fetchAPI('/suppliers');
export const getBranches = () => fetchAPI('/branches');
export const getBranch = (id: number) => fetchAPI(`/branches/${id}`);

// Transfers
export const createTransfer = (data: any) => fetchAPI(`/branches/transfers`, { method: 'POST', body: JSON.stringify(data) });
export const getTransfers = (branchId: number) => fetchAPI(`/branches/${branchId}/transfers`);
export const acceptTransfer = (transferId: number) => fetchAPI(`/branches/transfers/${transferId}/accept`, { method: 'POST' });
