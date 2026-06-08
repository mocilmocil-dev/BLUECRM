import { User, Company, Target, Deal } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Pak Budi (GM)', role: 'GM' },
  { id: 'u2', name: 'Siti (Manager A)', role: 'Manager' },
  { id: 'u3', name: 'Andi (Manager B)', role: 'Manager' },
  { id: 'u8', name: 'Rina (Manager C)', role: 'Manager' },
  { id: 'u9', name: 'Fajar (Manager D)', role: 'Manager' },
  { id: 'u10', name: 'Nina (Manager E)', role: 'Manager' },
  { id: 'u4', name: 'Rina (Sales A1)', role: 'Sales', managerId: 'u2' },
  { id: 'u5', name: 'Tono (Sales A2)', role: 'Sales', managerId: 'u2' },
  { id: 'u6', name: 'Eko (Sales B1)', role: 'Sales', managerId: 'u3' },
  { id: 'u7', name: 'Dwi (Sales B2)', role: 'Sales', managerId: 'u3' },
  { id: 'u20', name: 'Zaki (Sales A3)', role: 'Sales', managerId: 'u2' },
  { id: 'u21', name: 'Yudi (Sales B3)', role: 'Sales', managerId: 'u3' },
  { id: 'u11', name: 'Bimo (Sales C1)', role: 'Sales', managerId: 'u8' },
  { id: 'u12', name: 'Citra (Sales C2)', role: 'Sales', managerId: 'u8' },
  { id: 'u13', name: 'Dodi (Sales C3)', role: 'Sales', managerId: 'u8' },
  { id: 'u14', name: 'Fina (Sales D1)', role: 'Sales', managerId: 'u9' },
  { id: 'u15', name: 'Gani (Sales D2)', role: 'Sales', managerId: 'u9' },
  { id: 'u16', name: 'Hani (Sales D3)', role: 'Sales', managerId: 'u9' },
  { id: 'u17', name: 'Jefri (Sales E1)', role: 'Sales', managerId: 'u10' },
  { id: 'u18', name: 'Kevin (Sales E2)', role: 'Sales', managerId: 'u10' },
  { id: 'u19', name: 'Lia (Sales E3)', role: 'Sales', managerId: 'u10' },
];

export const mockCompanies: Company[] = [
  {
    id: 'c1',
    name: 'PT Maju Bersama',
    industry: 'Technology',
    pics: [{ id: 'p1', name: 'Bapak Ilham', phone: '08123456789', email: 'ilham@majubersama.co.id' }]
  },
  {
    id: 'c2',
    name: 'CV Nusantara Sentosa',
    industry: 'Logistics',
    pics: [{ id: 'p2', name: 'Ibu Ratna', phone: '08198765432', email: 'ratna@nusantara.id' }]
  },
  {
    id: 'c3',
    name: 'PT Sinar Mas',
    industry: 'Finance',
    pics: [{ id: 'p3', name: 'Reza', phone: '08111222333', email: 'reza@sinarmas.com' }]
  },
  {
    id: 'c4',
    name: 'PT Telkomunikasi Indonesia',
    industry: 'Telecommunications',
    pics: [{ id: 'p4', name: 'Rudi', phone: '08123456744', email: 'rudi@telkom.co.id' }]
  },
  {
    id: 'c5',
    name: 'PT Astra International',
    industry: 'Automotive',
    pics: [{ id: 'p5', name: 'Dewi', phone: '08123456755', email: 'dewi@astra.co.id' }]
  },
  {
    id: 'c6',
    name: 'PT Bank Central Asia',
    industry: 'Banking',
    pics: [{ id: 'p6', name: 'Hendra', phone: '08123456766', email: 'hendra@bca.co.id' }]
  },
  {
    id: 'c7',
    name: 'PT Gudang Garam',
    industry: 'Consumer Goods',
    pics: [{ id: 'p7', name: 'Sanjaya', phone: '08123456777', email: 'sanjaya@gg.co.id' }]
  },
  {
    id: 'c8',
    name: 'PT Indofood Sukses Makmur',
    industry: 'Food and Beverage',
    pics: [{ id: 'p8', name: 'Anita', phone: '08123456788', email: 'anita@indofood.co.id' }]
  },
  {
    id: 'c9',
    name: 'PT Kalbe Farma',
    industry: 'Pharmaceuticals',
    pics: [{ id: 'p9', name: 'Lisa', phone: '08123456799', email: 'lisa@kalbe.co.id' }]
  },
  {
    id: 'c10',
    name: 'PT Unilever Indonesia',
    industry: 'Consumer Goods',
    pics: [{ id: 'p10', name: 'Bima', phone: '08133456701', email: 'bima@unilever.co.id' }]
  },
  {
    id: 'c11',
    name: 'PT Semen Indonesia',
    industry: 'Manufacturing',
    pics: [{ id: 'p11', name: 'Agus', phone: '08133456702', email: 'agus@semenindonesia.com' }]
  },
  {
    id: 'c12',
    name: 'PT Pertamina',
    industry: 'Energy',
    pics: [{ id: 'p12', name: 'Yanto', phone: '08133456703', email: 'yanto@pertamina.com' }]
  },
  {
    id: 'c13',
    name: 'PT Garuda Indonesia',
    industry: 'Aviation',
    pics: [{ id: 'p13', name: 'Sari', phone: '08133456704', email: 'sari@garuda.com' }]
  },
  {
    id: 'c14',
    name: 'PT PLN (Persero)',
    industry: 'Energy',
    pics: [{ id: 'p14', name: 'Bambang', phone: '08133456705', email: 'bambang@pln.co.id' }]
  },
  {
    id: 'c15',
    name: 'PT KAI (Persero)',
    industry: 'Transportation',
    pics: [{ id: 'p15', name: 'Joko', phone: '08133456706', email: 'joko@kai.id' }]
  },
  {
    id: 'c16',
    name: 'PT Bank Mandiri',
    industry: 'Banking',
    pics: [{ id: 'p16', name: 'Rina', phone: '08133456707', email: 'rina@bankmandiri.co.id' }]
  },
  {
    id: 'c17',
    name: 'PT Bank Rakyat Indonesia',
    industry: 'Banking',
    pics: [{ id: 'p17', name: 'Arief', phone: '08133456708', email: 'arief@bri.co.id' }]
  },
  {
    id: 'c18',
    name: 'PT HM Sampoerna',
    industry: 'Consumer Goods',
    pics: [{ id: 'p18', name: 'Dian', phone: '08133456709', email: 'dian@sampoerna.com' }]
  },
  {
    id: 'c19',
    name: 'PT GoTo Gojek Tokopedia',
    industry: 'Technology',
    pics: [{ id: 'p19', name: 'Kevin', phone: '08133456710', email: 'kevin@goto.com' }]
  },
  {
    id: 'c20',
    name: 'PT Bukalapak.com',
    industry: 'Technology',
    pics: [{ id: 'p20', name: 'Fajrin', phone: '08133456711', email: 'fajrin@bukalapak.com' }]
  },
  {
    id: 'c21',
    name: 'PT Traveloka',
    industry: 'Technology',
    pics: [{ id: 'p21', name: 'Ferry', phone: '08133456712', email: 'ferry@traveloka.com' }]
  },
  {
    id: 'c22',
    name: 'PT Shopee International Indonesia',
    industry: 'Technology',
    pics: [{ id: 'p22', name: 'Chris', phone: '08133456713', email: 'chris@shopee.co.id' }]
  }
];

export const mockTargets: Target[] = [
  {
    id: 't1',
    userId: 'u4', // Rina
    month: '2026-06',
    productTargets: {
      'Mobil Short Term': 50000000,
      'Bis Short Term': 150000000,
      'E-Voucher': 20000000,
      'Mobil Long Term': 300000000,
      'Bis Long Term': 500000000,
      'Supir': 10000000
    }
  },
  {
    id: 't2',
    userId: 'u5', // Tono
    month: '2026-06',
    productTargets: {
      'Mobil Short Term': 40000000,
      'Bis Short Term': 100000000,
      'E-Voucher': 15000000,
      'Mobil Long Term': 200000000,
      'Bis Long Term': 400000000,
      'Supir': 5000000
    }
  },
  {
    id: 't3',
    userId: 'u6', // Eko
    month: '2026-06',
    productTargets: {
      'Mobil Short Term': 100000000,
      'Bis Short Term': 200000000,
      'E-Voucher': 30000000,
      'Mobil Long Term': 400000000,
      'Bis Long Term': 600000000,
      'Supir': 20000000
    }
  },
  {
    id: 't4',
    userId: 'u7', // Dwi
    month: '2026-06',
    productTargets: {
      'Mobil Short Term': 30000000,
      'Bis Short Term': 80000000,
      'E-Voucher': 10000000,
      'Mobil Long Term': 150000000,
      'Bis Long Term': 300000000,
      'Supir': 8000000
    }
  },
  {
    id: 't5',
    userId: 'u11',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 50000000, 'Bis Short Term': 150000000, 'E-Voucher': 20000000, 'Mobil Long Term': 300000000, 'Bis Long Term': 500000000, 'Supir': 10000000 }
  },
  {
    id: 't6',
    userId: 'u12',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 40000000, 'Bis Short Term': 100000000, 'E-Voucher': 15000000, 'Mobil Long Term': 200000000, 'Bis Long Term': 400000000, 'Supir': 5000000 }
  },
  {
    id: 't7',
    userId: 'u13',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 30000000, 'Bis Short Term': 80000000, 'E-Voucher': 10000000, 'Mobil Long Term': 150000000, 'Bis Long Term': 300000000, 'Supir': 8000000 }
  },
  {
    id: 't8',
    userId: 'u14',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 50000000, 'Bis Short Term': 150000000, 'E-Voucher': 20000000, 'Mobil Long Term': 300000000, 'Bis Long Term': 500000000, 'Supir': 10000000 }
  },
  {
    id: 't9',
    userId: 'u15',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 40000000, 'Bis Short Term': 100000000, 'E-Voucher': 15000000, 'Mobil Long Term': 200000000, 'Bis Long Term': 400000000, 'Supir': 5000000 }
  },
  {
    id: 't10',
    userId: 'u16',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 30000000, 'Bis Short Term': 80000000, 'E-Voucher': 10000000, 'Mobil Long Term': 150000000, 'Bis Long Term': 300000000, 'Supir': 8000000 }
  },
  {
    id: 't11',
    userId: 'u17',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 50000000, 'Bis Short Term': 150000000, 'E-Voucher': 20000000, 'Mobil Long Term': 300000000, 'Bis Long Term': 500000000, 'Supir': 10000000 }
  },
  {
    id: 't12',
    userId: 'u18',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 40000000, 'Bis Short Term': 100000000, 'E-Voucher': 15000000, 'Mobil Long Term': 200000000, 'Bis Long Term': 400000000, 'Supir': 5000000 }
  },
  {
    id: 't13',
    userId: 'u19',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 30000000, 'Bis Short Term': 80000000, 'E-Voucher': 10000000, 'Mobil Long Term': 150000000, 'Bis Long Term': 300000000, 'Supir': 8000000 }
  },
  {
    id: 't14',
    userId: 'u20',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 40000000, 'Bis Short Term': 100000000, 'E-Voucher': 15000000, 'Mobil Long Term': 300000000, 'Bis Long Term': 200000000, 'Supir': 5000000 }
  },
  {
    id: 't15',
    userId: 'u21',
    month: '2026-06',
    productTargets: { 'Mobil Short Term': 30000000, 'Bis Short Term': 80000000, 'E-Voucher': 10000000, 'Mobil Long Term': 150000000, 'Bis Long Term': 300000000, 'Supir': 8000000 }
  }
];

export const mockDeals: Deal[] = [
  {
    id: 'd1',
    title: 'Sewa Avanza Bulanan',
    companyId: 'c1',
    picId: 'p1',
    salesId: 'u4',
    products: [
      { id: 'p1', category: 'Mobil Short Term', quantity: 1, estimatedValue: 40000000 }
    ],
    stage: 'Won',
    estimatedValue: 40000000,
    actualValue: 40000000,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-03T14:30:00Z',
    history: [
      { id: 'h1', stage: 'Call/Meeting', subType: 'Call', timestamp: '2026-06-01T10:00:00Z' },
      { id: 'h2', stage: 'Prospecting', timestamp: '2026-06-01T15:00:00Z' },
      { id: 'h3', stage: 'Proposal', timestamp: '2026-06-02T09:00:00Z' },
      { id: 'h4', stage: 'Negotiation', timestamp: '2026-06-03T10:00:00Z' },
      { id: 'h5', stage: 'Won', timestamp: '2026-06-03T14:30:00Z' }
    ]
  },
  {
    id: 'd2',
    title: 'Bus Karyawan Tahunan',
    companyId: 'c2',
    picId: 'p2',
    salesId: 'u4',
    products: [
      { id: 'p2', category: 'Bis Long Term', quantity: 1, estimatedValue: 450000000 }
    ],
    stage: 'Negotiation',
    estimatedValue: 450000000,
    createdAt: '2026-06-02T11:00:00Z',
    updatedAt: '2026-06-04T16:00:00Z',
    history: [
      { id: 'h6', stage: 'Call/Meeting', subType: 'Offline Meeting', timestamp: '2026-06-02T11:00:00Z' },
      { id: 'h7', stage: 'Prospecting', timestamp: '2026-06-03T10:00:00Z' },
      { id: 'h8', stage: 'Proposal', timestamp: '2026-06-03T16:00:00Z' },
      { id: 'h9', stage: 'Negotiation', timestamp: '2026-06-04T16:00:00Z' }
    ]
  },
  {
    id: 'd3',
    title: 'E-Voucher Reward',
    companyId: 'c3',
    picId: 'p3',
    salesId: 'u6',
    products: [
      { id: 'p3', category: 'E-Voucher', quantity: 1, estimatedValue: 50000000 }
    ],
    stage: 'Prospecting',
    estimatedValue: 50000000,
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-02T09:00:00Z',
    history: [
      { id: 'h10', stage: 'Call/Meeting', subType: 'Call', timestamp: '2026-06-01T08:00:00Z' },
      { id: 'h11', stage: 'Prospecting', timestamp: '2026-06-02T09:00:00Z' }
    ]
  },
  {
    id: 'd4',
    title: 'Sewa Innova Harian',
    companyId: 'c1',
    picId: 'p1',
    salesId: 'u5',
    products: [
      { id: 'p4', category: 'Mobil Short Term', quantity: 1, estimatedValue: 0 }
    ],
    stage: 'Call/Meeting',
    estimatedValue: 0,
    createdAt: '2026-06-03T13:00:00Z',
    updatedAt: '2026-06-03T13:00:00Z',
    history: [
      { id: 'h12', stage: 'Call/Meeting', subType: 'Call', timestamp: '2026-06-03T13:00:00Z' }
    ]
  },
  {
    id: 'd5',
    title: 'Bus Pariwisata',
    companyId: 'c2',
    picId: 'p2',
    salesId: 'u7',
    products: [
      { id: 'p5', category: 'Bis Short Term', quantity: 1, estimatedValue: 30000000 }
    ],
    stage: 'Lost',
    estimatedValue: 30000000,
    lostReason: 'Budget terlalu kecil dari client',
    createdAt: '2026-05-20T09:00:00Z',
    updatedAt: '2026-06-01T15:00:00Z',
    history: [
      { id: 'h13', stage: 'Call/Meeting', subType: 'Offline Meeting', timestamp: '2026-05-20T09:00:00Z' },
      { id: 'h14', stage: 'Prospecting', timestamp: '2026-05-22T10:00:00Z' },
      { id: 'h15', stage: 'Proposal', timestamp: '2026-05-25T14:00:00Z' },
      { id: 'h16', stage: 'Lost', timestamp: '2026-06-01T15:00:00Z' }
    ]
  },
  {
    id: 'd6', title: 'Sewa Mobil Operasional 1', companyId: 'c4', picId: 'p4', salesId: 'u20',
    products: [{ id: 'p6', category: 'Mobil Long Term', quantity: 2, estimatedValue: 120000000 }],
    stage: 'Proposal', estimatedValue: 120000000, createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-02T10:00:00Z',
    history: [{ id: 'h17', stage: 'Proposal', timestamp: '2026-06-02T10:00:00Z' }]
  },
  {
    id: 'd7', title: 'E-Voucher Q3', companyId: 'c5', picId: 'p5', salesId: 'u21',
    products: [{ id: 'p7', category: 'E-Voucher', quantity: 50, estimatedValue: 25000000 }],
    stage: 'Negotiation', estimatedValue: 25000000, createdAt: '2026-06-02T10:00:00Z', updatedAt: '2026-06-03T10:00:00Z',
    history: [{ id: 'h18', stage: 'Negotiation', timestamp: '2026-06-03T10:00:00Z' }]
  },
  {
    id: 'd8', title: 'Bis Eksekutif', companyId: 'c6', picId: 'p6', salesId: 'u11',
    products: [{ id: 'p8', category: 'Bis Short Term', quantity: 1, estimatedValue: 15000000 }],
    stage: 'Call/Meeting', estimatedValue: 15000000, createdAt: '2026-06-03T10:00:00Z', updatedAt: '2026-06-04T10:00:00Z',
    history: [{ id: 'h19', stage: 'Call/Meeting', subType: 'Call', timestamp: '2026-06-04T10:00:00Z' }]
  },
  {
    id: 'd9', title: 'Sewa Avanza', companyId: 'c7', picId: 'p7', salesId: 'u12',
    products: [{ id: 'p9', category: 'Mobil Short Term', quantity: 1, estimatedValue: 10000000 }],
    stage: 'Prospecting', estimatedValue: 10000000, createdAt: '2026-06-04T10:00:00Z', updatedAt: '2026-06-05T10:00:00Z',
    history: [{ id: 'h20', stage: 'Prospecting', timestamp: '2026-06-05T10:00:00Z' }]
  },
  {
    id: 'd10', title: 'Bis Karyawan', companyId: 'c8', picId: 'p8', salesId: 'u13',
    products: [{ id: 'p10', category: 'Bis Long Term', quantity: 2, estimatedValue: 300000000 }],
    stage: 'Proposal', estimatedValue: 300000000, createdAt: '2026-06-01T09:00:00Z', updatedAt: '2026-06-02T09:00:00Z',
    history: [{ id: 'h21', stage: 'Proposal', timestamp: '2026-06-02T09:00:00Z' }]
  },
  {
    id: 'd11', title: 'Rental Mobil Direksi', companyId: 'c9', picId: 'p9', salesId: 'u14',
    products: [{ id: 'p11', category: 'Mobil Long Term', quantity: 1, estimatedValue: 80000000 }],
    stage: 'Negotiation', estimatedValue: 80000000, createdAt: '2026-06-02T09:00:00Z', updatedAt: '2026-06-03T09:00:00Z',
    history: [{ id: 'h22', stage: 'Negotiation', timestamp: '2026-06-03T09:00:00Z' }]
  },
  {
    id: 'd12', title: 'Voucher Karyawan', companyId: 'c10', picId: 'p10', salesId: 'u15',
    products: [{ id: 'p12', category: 'E-Voucher', quantity: 100, estimatedValue: 50000000 }],
    stage: 'Won', estimatedValue: 50000000, actualValue: 50000000, createdAt: '2026-06-03T09:00:00Z', updatedAt: '2026-06-04T09:00:00Z',
    history: [{ id: 'h23', stage: 'Won', timestamp: '2026-06-04T09:00:00Z' }]
  },
  {
    id: 'd13', title: 'Sewa Harian Innova', companyId: 'c11', picId: 'p11', salesId: 'u16',
    products: [{ id: 'p13', category: 'Mobil Short Term', quantity: 1, estimatedValue: 6000000 }],
    stage: 'Call/Meeting', estimatedValue: 6000000, createdAt: '2026-06-04T09:00:00Z', updatedAt: '2026-06-05T09:00:00Z',
    history: [{ id: 'h24', stage: 'Call/Meeting', subType: 'Offline Meeting', timestamp: '2026-06-05T09:00:00Z' }]
  },
  {
    id: 'd14', title: 'Tour Bus Study', companyId: 'c12', picId: 'p12', salesId: 'u17',
    products: [{ id: 'p14', category: 'Bis Short Term', quantity: 4, estimatedValue: 40000000 }],
    stage: 'Prospecting', estimatedValue: 40000000, createdAt: '2026-06-01T11:00:00Z', updatedAt: '2026-06-02T11:00:00Z',
    history: [{ id: 'h25', stage: 'Prospecting', timestamp: '2026-06-02T11:00:00Z' }]
  },
  {
    id: 'd15', title: 'Armada Distribusi', companyId: 'c13', picId: 'p13', salesId: 'u18',
    products: [{ id: 'p15', category: 'Mobil Long Term', quantity: 5, estimatedValue: 400000000 }],
    stage: 'Proposal', estimatedValue: 400000000, createdAt: '2026-06-02T11:00:00Z', updatedAt: '2026-06-03T11:00:00Z',
    history: [{ id: 'h26', stage: 'Proposal', timestamp: '2026-06-03T11:00:00Z' }]
  },
  {
    id: 'd16', title: 'Maintenance Staff Transport', companyId: 'c14', picId: 'p14', salesId: 'u19',
    products: [{ id: 'p16', category: 'Bis Long Term', quantity: 1, estimatedValue: 150000000 }],
    stage: 'Negotiation', estimatedValue: 150000000, createdAt: '2026-06-03T11:00:00Z', updatedAt: '2026-06-04T11:00:00Z',
    history: [{ id: 'h27', stage: 'Negotiation', timestamp: '2026-06-04T11:00:00Z' }]
  }
];
