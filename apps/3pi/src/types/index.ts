// Organization types
export interface Organization {
  id: string;
  name: string;
  type: 'shelter' | 'pet-store' | 'airport' | 'referral-partner';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  status: 'pending' | 'verified' | 'rejected';
  verificationDocuments: VerificationDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationDocument {
  id: string;
  type: 'business-license' | 'certification' | 'insurance' | 'other';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
}

// User types
export interface User {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'view-only';
  status: 'pending' | 'active' | 'inactive';
  profilePicture?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Pet types
export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  age: number;
  ownerId: string;
  ownerName: string;
  microchipNumber?: string;
  spayedNeutered: boolean;
  photoUrl?: string;
  complianceStatus: 'compliant' | 'needs-review' | 'non-compliant';
  lastCheckIn?: Date;
}

// Compliance types
export interface ComplianceCheck {
  id: string;
  petId: string;
  organizationId: string;
  userId: string;
  status: 'pending' | 'compliant' | 'non-compliant';
  requirements: ComplianceRequirement[];
  checkedInAt: Date;
  notes?: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  type: 'vaccination' | 'health-check' | 'microchip' | 'other';
  required: boolean;
  status: 'met' | 'missing' | 'expired';
  expirationDate?: Date;
  notes?: string;
}

// Revenue types
export interface Revenue {
  id: string;
  organizationId: string;
  amount: number;
  type: 'referral' | 'commission' | 'bonus';
  status: 'pending' | 'paid' | 'processing';
  description: string;
  createdAt: Date;
  paidAt?: Date;
}

// Request types
export interface OwnerRequest {
  id: string;
  petId: string;
  ownerId: string;
  organizationId: string;
  type: 'record-access' | 'compliance-check' | 'document-request';
  status: 'pending' | 'in-progress' | 'completed' | 'declined';
  description: string;
  requestedAt: Date;
  completedAt?: Date;
  response?: string;
}
