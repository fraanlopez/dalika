import type { User, Brand, Category, QuoteRequest, DashboardMetrics } from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@dalika.com',
    name: 'Administrador',
    role: 'ADMIN',
    createdAt: '2024-01-15T10:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    email: 'rep@dalika.com',
    name: 'Juan Perez',
    role: 'REP',
    createdAt: '2024-02-20T14:30:00Z',
    isActive: true,
  },
  {
    id: '3',
    email: 'client@example.com',
    name: 'Maria Garcia',
    role: 'CLIENT',
    createdAt: '2024-03-10T09:15:00Z',
    isActive: true,
  },
  {
    id: '4',
    email: 'client2@example.com',
    name: 'Carlos Lopez',
    role: 'CLIENT',
    createdAt: '2024-04-05T11:45:00Z',
    isActive: true,
  },
  {
    id: '5',
    email: 'rep2@dalika.com',
    name: 'Ana Martinez',
    role: 'REP',
    createdAt: '2024-01-25T16:00:00Z',
    isActive: false,
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronica', description: 'Productos electronicos y tecnologicos', brandCount: 5, createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Hogar', description: 'Articulos para el hogar y decoracion', brandCount: 3, createdAt: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Industrial', description: 'Equipos y herramientas industriales', brandCount: 4, createdAt: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'Oficina', description: 'Mobiliario y suministros de oficina', brandCount: 2, createdAt: '2024-01-01T00:00:00Z' },
  { id: '5', name: 'Deportes', description: 'Equipamiento deportivo y fitness', brandCount: 3, createdAt: '2024-01-01T00:00:00Z' },
];

export const MOCK_BRANDS: Brand[] = [
  { id: '1', name: 'Samsung', logoUrl: 'https://placehold.co/120x60/1e293b/ffffff?text=Samsung', description: 'Lider en tecnologia y electronica de consumo', externalLink: 'https://www.samsung.com', categories: [{ id: '1', name: 'Electronica' }], isActive: true, createdAt: '2024-01-10T00:00:00Z' },
  { id: '2', name: 'LG', logoUrl: 'https://placehold.co/120x60/7c3aed/ffffff?text=LG', description: 'Innovacion en electrodomesticos y pantallas', externalLink: 'https://www.lg.com', categories: [{ id: '1', name: 'Electronica' }], isActive: true, createdAt: '2024-01-12T00:00:00Z' },
  { id: '3', name: 'Sony', logoUrl: 'https://placehold.co/120x60/000000/ffffff?text=Sony', description: 'Audio, video y entretenimiento premium', externalLink: 'https://www.sony.com', categories: [{ id: '1', name: 'Electronica' }], isActive: true, createdAt: '2024-01-15T00:00:00Z' },
  { id: '4', name: 'Bosch', logoUrl: 'https://placehold.co/120x60/e11d48/ffffff?text=Bosch', description: 'Herramientas y electrodomesticos de alta calidad', externalLink: 'https://www.bosch.com', categories: [{ id: '3', name: 'Industrial' }], isActive: true, createdAt: '2024-01-20T00:00:00Z' },
  { id: '5', name: 'IKEA', logoUrl: 'https://placehold.co/120x60/2563eb/ffffff?text=IKEA', description: 'Muebles y decoracion para el hogar', externalLink: 'https://www.ikea.com', categories: [{ id: '2', name: 'Hogar' }], isActive: true, createdAt: '2024-02-01T00:00:00Z' },
  { id: '6', name: 'Herman Miller', logoUrl: 'https://placehold.co/120x60/059669/ffffff?text=Herman+Miller', description: 'Mobiliario de oficina ergonomico premium', externalLink: 'https://www.hermanmiller.com', categories: [{ id: '4', name: 'Oficina' }], isActive: true, createdAt: '2024-02-10T00:00:00Z' },
  { id: '7', name: 'Nike', logoUrl: 'https://placehold.co/120x60/111111/ffffff?text=Nike', description: 'Equipamiento deportivo de alto rendimiento', externalLink: 'https://www.nike.com', categories: [{ id: '5', name: 'Deportes' }], isActive: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: '8', name: 'Adidas', logoUrl: 'https://placehold.co/120x60/1e293b/ffffff?text=Adidas', description: 'Ropa y calzado deportivo', externalLink: 'https://www.adidas.com', categories: [{ id: '5', name: 'Deportes' }], isActive: true, createdAt: '2024-02-20T00:00:00Z' },
  { id: '9', name: 'DeWalt', logoUrl: 'https://placehold.co/120x60/f59e0b/000000?text=DeWalt', description: 'Herramientas electricas profesionales', externalLink: 'https://www.dewalt.com', categories: [{ id: '3', name: 'Industrial' }], isActive: true, createdAt: '2024-03-01T00:00:00Z' },
  { id: '10', name: 'Apple', logoUrl: 'https://placehold.co/120x60/333333/ffffff?text=Apple', description: 'Dispositivos y ecosistema tecnologico', externalLink: 'https://www.apple.com', categories: [{ id: '1', name: 'Electronica' }], isActive: true, createdAt: '2024-03-05T00:00:00Z' },
  { id: '11', name: 'Philips', logoUrl: 'https://placehold.co/120x60/0891b2/ffffff?text=Philips', description: 'Soluciones de salud y bienestar', externalLink: 'https://www.philips.com', categories: [{ id: '2', name: 'Hogar' }], isActive: true, createdAt: '2024-03-10T00:00:00Z' },
  { id: '12', name: 'Makita', logoUrl: 'https://placehold.co/120x60/16a34a/ffffff?text=Makita', description: 'Herramientas electricas industriales', externalLink: 'https://www.makita.com', categories: [{ id: '3', name: 'Industrial' }], isActive: false, createdAt: '2024-03-15T00:00:00Z' },
];

export const MOCK_QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: 'qr-001',
    clientId: '3',
    clientName: 'Maria Garcia',
    title: 'Equipamiento de oficina nuevo',
    description: 'Necesito cotizacion para equipar una oficina de 20 personas con computadoras, monitores y sillas ergonomicas.',
    items: [
      { id: 'item-1', productUrl: 'https://www.apple.com/macbook-pro', productName: 'MacBook Pro 14"', quantity: null },
      { id: 'item-2', productUrl: 'https://www.hermanmiller.com/aeron', productName: 'Silla Aeron', quantity: null },
      { id: 'item-3', productUrl: 'https://www.samsung.com/monitors', productName: 'Monitor Samsung 27"', quantity: null },
    ],
    status: 'QUOTED',
    response: {
      id: 'resp-1',
      quoteUrl: 'https://cotizacion.dalika.com/qr-001',
      invoiceUrl: null,
      trackingUrl: null,
      adminNotes: 'Cotizacion enviada con descuento corporativo del 15%.',
      createdAt: '2024-11-22T14:30:00Z',
    },
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-22T14:30:00Z',
    respondedAt: '2024-11-22T14:30:00Z',
    expiresAt: '2024-12-22T14:30:00Z',
  },
  {
    id: 'qr-002',
    clientId: '3',
    clientName: 'Maria Garcia',
    title: 'Herramientas industriales',
    description: 'Requiere cotizacion de herramientas electricas para planta de produccion.',
    items: [
      { id: 'item-4', productUrl: 'https://www.dewalt.com/drills', productName: 'Taladro DeWalt 20V', quantity: null },
      { id: 'item-5', productUrl: 'https://www.bosch.com/grinders', productName: 'Amoladora Bosch', quantity: null },
    ],
    status: 'PENDING',
    response: null,
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
    respondedAt: null,
    expiresAt: null,
  },
  {
    id: 'qr-003',
    clientId: '4',
    clientName: 'Carlos Lopez',
    title: 'Equipamiento deportivo gimnasio',
    description: 'Cotizacion para equipar un gimnasio pequeno con equipos de cardio y peso.',
    items: [
      { id: 'item-6', productUrl: 'https://www.nike.com/training', productName: 'Equipos Nike Training', quantity: null },
    ],
    status: 'PENDING',
    response: null,
    createdAt: '2024-12-03T11:30:00Z',
    updatedAt: '2024-12-03T11:30:00Z',
    respondedAt: null,
    expiresAt: null,
  },
  {
    id: 'qr-004',
    clientId: '4',
    clientName: 'Carlos Lopez',
    title: 'Muebles para restaurante',
    description: 'Necesito mesas, sillas y iluminacion para un restaurante de 50 personas.',
    items: [
      { id: 'item-7', productUrl: 'https://www.ikea.com/tables', productName: 'Mesas IKEA comerciales', quantity: null },
      { id: 'item-8', productUrl: 'https://www.philips.com/lighting', productName: 'Iluminacion Philips', quantity: null },
    ],
    status: 'EXPIRED',
    response: null,
    createdAt: '2024-10-15T08:00:00Z',
    updatedAt: '2024-11-15T08:00:00Z',
    respondedAt: null,
    expiresAt: '2024-11-15T08:00:00Z',
  },
  {
    id: 'qr-005',
    clientId: '3',
    clientName: 'Maria Garcia',
    title: 'Televisores para sala de espera',
    description: '3 televisores de 55 pulgadas para sala de espera de clinica.',
    items: [
      { id: 'item-9', productUrl: 'https://www.samsung.com/tv/55', productName: 'Samsung TV 55"', quantity: null },
    ],
    status: 'QUOTED',
    response: {
      id: 'resp-2',
      quoteUrl: 'https://cotizacion.dalika.com/qr-005',
      invoiceUrl: null,
      trackingUrl: null,
      adminNotes: null,
      createdAt: '2024-11-30T10:00:00Z',
    },
    createdAt: '2024-11-28T15:00:00Z',
    updatedAt: '2024-11-30T10:00:00Z',
    respondedAt: '2024-11-30T10:00:00Z',
    expiresAt: '2024-12-30T10:00:00Z',
  },
];

export const MOCK_METRICS_CLIENT: DashboardMetrics = {
  totalQuoteRequests: 3,
  pendingQuoteRequests: 1,
  quotedQuoteRequests: 2,
  expiredQuoteRequests: 1,
  totalBrands: MOCK_BRANDS.length,
  totalClients: 0,
  recentQuoteRequests: MOCK_QUOTE_REQUESTS.filter((_, i) => i < 3),
};

export const MOCK_METRICS_ADMIN: DashboardMetrics = {
  totalQuoteRequests: 5,
  pendingQuoteRequests: 2,
  quotedQuoteRequests: 2,
  expiredQuoteRequests: 1,
  totalBrands: MOCK_BRANDS.length,
  totalClients: MOCK_USERS.filter((u) => u.role === 'CLIENT').length,
  recentQuoteRequests: MOCK_QUOTE_REQUESTS.filter((_, i) => i < 5),
};

export const MOCK_METRICS_REP: DashboardMetrics = {
  totalQuoteRequests: 5,
  pendingQuoteRequests: 2,
  quotedQuoteRequests: 2,
  expiredQuoteRequests: 1,
  totalBrands: MOCK_BRANDS.length,
  totalClients: MOCK_USERS.filter((u) => u.role === 'CLIENT').length,
  recentQuoteRequests: MOCK_QUOTE_REQUESTS.filter((_, i) => i < 3),
};

export const MOCK_CREDENTIALS: Record<string, { password: string; user: User }> = {
  'admin@dalika.com': { password: 'admin123', user: MOCK_USERS[0] },
  'rep@dalika.com': { password: 'rep123', user: MOCK_USERS[1] },
  'client@example.com': { password: 'client123', user: MOCK_USERS[2] },
};
