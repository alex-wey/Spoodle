import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:8081', 'http://localhost:19006'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data for development
const mockPets = [
  {
    id: '1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    ownerName: 'Sarah Johnson',
    ownerEmail: 'sarah.johnson@email.com',
    ownerPhone: '(555) 123-4567',
    microchipNumber: '985141000123456',
    spoodleId: 'SP001234',
    spayNeuterStatus: 'neutered',
    complianceStatus: 'compliant',
    lastCheckIn: new Date('2024-01-15'),
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=face',
    notes: [
      'Friendly and well-behaved during visits',
      'Owner prefers morning appointments',
      'Allergic to chicken - use alternative treats'
    ]
  },
  {
    id: '2',
    name: 'Luna',
    type: 'cat',
    breed: 'Siamese',
    age: 2,
    ownerName: 'Michael Chen',
    ownerEmail: 'michael.chen@email.com',
    ownerPhone: '(555) 234-5678',
    spoodleId: 'SP001235',
    complianceStatus: 'missing-records',
    lastCheckIn: new Date('2024-01-10'),
    notes: []
  }
];

const mockMedicalRecords = [
  {
    id: '1',
    petId: '1',
    type: 'vaccination',
    title: 'Rabies Vaccination',
    description: 'Annual rabies vaccination administered',
    date: new Date('2024-01-10'),
    expirationDate: new Date('2025-01-10'),
    status: 'active',
    documentUrl: '/documents/rabies-vaccination-max.pdf',
    uploadedBy: 'Dr. Smith',
    uploadedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    petId: '1',
    type: 'vaccination',
    title: 'DHPP Vaccination',
    description: 'Core vaccination series completed',
    date: new Date('2024-01-10'),
    expirationDate: new Date('2025-01-10'),
    status: 'active',
    documentUrl: '/documents/dhpp-vaccination-max.pdf',
    uploadedBy: 'Dr. Smith',
    uploadedAt: new Date('2024-01-10')
  }
];

const mockComplianceRequirements = [
  {
    id: '1',
    name: 'Rabies Vaccination',
    description: 'Current rabies vaccination required',
    required: true,
    category: 'vaccination',
    status: 'met',
    documentUrl: '/documents/rabies-vaccination-max.pdf',
    expirationDate: new Date('2025-01-10')
  },
  {
    id: '2',
    name: 'DHPP Vaccination',
    description: 'Core vaccination series',
    required: true,
    category: 'vaccination',
    status: 'met',
    documentUrl: '/documents/dhpp-vaccination-max.pdf',
    expirationDate: new Date('2025-01-10')
  },
  {
    id: '3',
    name: 'Bordetella Vaccination',
    description: 'Kennel cough prevention',
    required: true,
    category: 'vaccination',
    status: 'met',
    documentUrl: '/documents/bordetella-vaccination-max.pdf',
    expirationDate: new Date('2025-01-10')
  },
  {
    id: '4',
    name: 'Flea/Tick Prevention',
    description: 'Current flea and tick prevention',
    required: true,
    category: 'prevention',
    status: 'met',
    documentUrl: '/documents/flea-tick-prevention-max.pdf',
    expirationDate: new Date('2024-04-15')
  }
];

const mockComplianceChecks = [
  {
    id: '1',
    petId: '1',
    date: new Date('2024-01-15'),
    performedBy: 'Jane Doe',
    status: 'passed',
    notes: 'All requirements met for boarding',
    requirements: [
      { name: 'Rabies Vaccination', status: 'met' },
      { name: 'DHPP Vaccination', status: 'met' },
      { name: 'Bordetella Vaccination', status: 'met' },
      { name: 'Flea/Tick Prevention', status: 'met' },
      { name: 'Health Certificate', status: 'met' }
    ]
  }
];

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Spoodle API',
    version: '1.0.0'
  });
});

// Pet search endpoint
app.get('/api/pets/search', (req: Request, res: Response) => {
  const { q, type, status } = req.query;
  
  let results = mockPets.filter(pet => {
    const matchesQuery = q ? 
      pet.name.toLowerCase().includes(q.toString().toLowerCase()) ||
      pet.ownerName.toLowerCase().includes(q.toString().toLowerCase()) ||
      pet.microchipNumber?.toLowerCase().includes(q.toString().toLowerCase()) ||
      pet.spoodleId.toLowerCase().includes(q.toString().toLowerCase()) : true;
    
    const matchesType = type && type !== 'all' ? pet.type === type : true;
    const matchesStatus = status && status !== 'all' ? pet.complianceStatus === status : true;
    
    return matchesQuery && matchesType && matchesStatus;
  });

  res.json({ 
    success: true, 
    data: results,
    message: `Found ${results.length} pets`
  });
});

// Get pet by ID
app.get('/api/pets/:id', (req: Request, res: Response) => {
  const pet = mockPets.find(p => p.id === req.params.id);
  
  if (pet) {
    // Add compliance requirements to the pet
    const petWithRequirements = {
      ...pet,
      requirements: mockComplianceRequirements
    };
    
    res.json({ 
      success: true, 
      data: petWithRequirements 
    });
  } else {
    res.status(404).json({ 
      success: false, 
      error: 'Pet not found' 
    });
  }
});

// Get pet by microchip
app.get('/api/pets/microchip/:microchip', (req: Request, res: Response) => {
  const pet = mockPets.find(p => p.microchipNumber === req.params.microchip);
  
  if (pet) {
    // Add compliance requirements to the pet
    const petWithRequirements = {
      ...pet,
      requirements: mockComplianceRequirements
    };
    
    res.json({ 
      success: true, 
      data: petWithRequirements 
    });
  } else {
    res.status(404).json({ 
      success: false, 
      error: 'Pet not found' 
    });
  }
});

// Get pet by Spoodle ID
app.get('/api/pets/spoodle/:spoodleId', (req: Request, res: Response) => {
  const pet = mockPets.find(p => p.spoodleId === req.params.spoodleId);
  
  if (pet) {
    // Add compliance requirements to the pet
    const petWithRequirements = {
      ...pet,
      requirements: mockComplianceRequirements
    };
    
    res.json({ 
      success: true, 
      data: petWithRequirements 
    });
  } else {
    res.status(404).json({ 
      success: false, 
      error: 'Pet not found' 
    });
  }
});

// Get medical records for a pet
app.get('/api/pets/:petId/medical-records', (req: Request, res: Response) => {
  const records = mockMedicalRecords.filter(r => r.petId === req.params.petId);
  
  res.json({ 
    success: true, 
    data: records,
    message: `Found ${records.length} medical records`
  });
});

// Get compliance requirements for a pet
app.get('/api/pets/:petId/compliance-requirements', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    data: mockComplianceRequirements,
    message: `Found ${mockComplianceRequirements.length} compliance requirements`
  });
});

// Perform compliance check
app.post('/api/pets/:petId/compliance-check', (req: Request, res: Response) => {
  const { requirements, overallNotes } = req.body;
  
  // In a real app, this would save to the database
  const newCheck = {
    id: Date.now().toString(),
    petId: req.params.petId,
    date: new Date(),
    performedBy: 'Current User', // Would come from auth
    status: requirements.every((r: any) => r.status === 'met') ? 'passed' : 'partial',
    notes: overallNotes || '',
    requirements: requirements
  };
  
  mockComplianceChecks.push(newCheck);
  
  res.json({ 
    success: true, 
    data: newCheck,
    message: 'Compliance check completed successfully'
  });
});

// Get compliance history for a pet
app.get('/api/pets/:petId/compliance-history', (req: Request, res: Response) => {
  const checks = mockComplianceChecks.filter(c => c.petId === req.params.petId);
  
  res.json({ 
    success: true, 
    data: checks,
    message: `Found ${checks.length} compliance checks`
  });
});

// Register new pet
app.post('/api/pets/register', (req: Request, res: Response) => {
  const petData = req.body;
  
  // Validate required fields
  if (!petData.name || !petData.type || !petData.breed || !petData.ownerName || !petData.ownerEmail || !petData.ownerPhone) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, type, breed, ownerName, ownerEmail, ownerPhone'
    });
  }
  
  // Create new pet with generated ID
  const newPet = {
    id: `pet_${Date.now()}`,
    name: petData.name,
    type: petData.type,
    breed: petData.breed,
    age: petData.age || 0,
    ownerName: petData.ownerName,
    ownerEmail: petData.ownerEmail,
    ownerPhone: petData.ownerPhone,
    microchipNumber: petData.microchipNumber || '',
    spoodleId: `SP${String(Date.now()).slice(-6)}`,
    spayNeuterStatus: petData.spayNeuterStatus || 'unknown',
    complianceStatus: 'pending',
    lastCheckIn: new Date(),
    photo: '',
    notes: []
  };
  
  // Add to mock data
  mockPets.push(newPet);
  
  res.status(201).json({
    success: true,
    data: newPet,
    message: 'Pet registered successfully'
  });
});

// Get reports data
app.get('/api/reports', (req: Request, res: Response) => {
  const { dateRange = '30d' } = req.query;
  
  // Mock reports data
  const reportsData = {
    totalPets: mockPets.length,
    compliantPets: Math.floor(mockPets.length * 0.72), // 72% compliance rate
    nonCompliantPets: Math.floor(mockPets.length * 0.28),
    recentCheckIns: Math.floor(mockPets.length * 0.15), // 15% checked in recently
    monthlyTrends: [
      { month: 'Jan', checkIns: 45, complianceChecks: 23 },
      { month: 'Feb', checkIns: 52, complianceChecks: 28 },
      { month: 'Mar', checkIns: 48, complianceChecks: 31 },
      { month: 'Apr', checkIns: 61, complianceChecks: 35 },
      { month: 'May', checkIns: 58, complianceChecks: 42 },
      { month: 'Jun', checkIns: 67, complianceChecks: 38 },
    ],
    topPetTypes: [
      { type: 'Dogs', count: Math.floor(mockPets.length * 0.54), percentage: 54.4 },
      { type: 'Cats', count: Math.floor(mockPets.length * 0.34), percentage: 33.9 },
      { type: 'Birds', count: Math.floor(mockPets.length * 0.07), percentage: 7.1 },
      { type: 'Other', count: Math.floor(mockPets.length * 0.05), percentage: 4.6 },
    ],
    complianceByCategory: [
      { category: 'Vaccination', compliant: 156, nonCompliant: 23, total: 179 },
      { category: 'Health Check', compliant: 134, nonCompliant: 18, total: 152 },
      { category: 'Prevention', compliant: 98, nonCompliant: 31, total: 129 },
      { category: 'Documentation', compliant: 87, nonCompliant: 42, total: 129 },
    ],
  };
  
  res.json({
    success: true,
    data: reportsData,
    message: `Reports data for ${dateRange}`
  });
});

// Basic endpoints (keeping for backward compatibility)
app.get('/api/pets', (req: Request, res: Response) => {
  res.json({ success: true, data: mockPets, message: 'Pets endpoint' });
});

app.get('/api/appointments', (req: Request, res: Response) => {
  res.json({ success: true, data: [], message: 'Appointments endpoint (placeholder)' });
});

app.get('/api/tasks', (req: Request, res: Response) => {
  res.json({ success: true, data: [], message: 'Tasks endpoint (placeholder)' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Spoodle API server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 