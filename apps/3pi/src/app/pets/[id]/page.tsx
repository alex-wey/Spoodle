'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { apiService, Pet, MedicalRecord, ComplianceCheck } from '@/lib/api';

export default function PetProfilePage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'compliance' | 'notes'>('overview');

  useEffect(() => {
    const loadPetData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load pet data
        const petResponse = await apiService.getPetById(params.id);
        if (petResponse.success && petResponse.data) {
          setPet(petResponse.data);
        } else {
          setError(petResponse.error || 'Failed to load pet data');
          return;
        }

        // Load medical records
        const recordsResponse = await apiService.getMedicalRecords(params.id);
        if (recordsResponse.success && recordsResponse.data) {
          setMedicalRecords(recordsResponse.data);
        }

        // Load compliance history
        const complianceResponse = await apiService.getComplianceHistory(params.id);
        if (complianceResponse.success && complianceResponse.data) {
          setComplianceChecks(complianceResponse.data);
        }
      } catch (err) {
        setError('An error occurred while loading pet data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPetData();
  }, [params.id]);

  const getStatusColor = (status: Pet['complianceStatus']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'missing-records':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'action-needed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: Pet['complianceStatus']) => {
    switch (status) {
      case 'compliant':
        return 'Compliant';
      case 'missing-records':
        return 'Missing Records';
      case 'action-needed':
        return 'Action Needed';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = (type: Pet['type']) => {
    switch (type) {
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐱';
      case 'bird':
        return '🐦';
      default:
        return '🐾';
    }
  };

  const getRecordTypeIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'vaccination':
        return '💉';
      case 'health-check':
        return '🏥';
      case 'treatment':
        return '💊';
      case 'test-result':
        return '🔬';
      case 'boarding':
        return '🏠';
      default:
        return '📄';
    }
  };

  const getRecordStatusColor = (status: MedicalRecord['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const addNote = () => {
    if (!newNote.trim() || !pet) return;
    
    setPet(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: [...prev.notes, newNote]
      };
    });
    setNewNote('');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!pet) {
    return <div className="text-center py-8">Pet not found.</div>;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Pet Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                  {pet.photo ? (
                    <img 
                      src={pet.photo} 
                      alt={pet.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    getTypeIcon(pet.type)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{pet.name}</h2>
                  <p className="text-gray-600">{getTypeIcon(pet.type)} {pet.breed}</p>
                  <p className="text-gray-600">{pet.age} years old</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p><strong>Spoodle ID:</strong> {pet.spoodleId}</p>
                {pet.microchipNumber && (
                  <p><strong>Microchip:</strong> {pet.microchipNumber}</p>
                )}
                <p><strong>Spay/Neuter:</strong> {pet.spayNeuterStatus.replace(/\b\w/g, l => l.toUpperCase())}</p>
                <p><strong>Last Check-in:</strong> {pet.lastCheckIn?.toLocaleDateString() || 'Never'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Owner Information</h3>
                <div className="space-y-1">
                  <p><strong>Name:</strong> {pet.ownerName}</p>
                  <p><strong>Email:</strong> {pet.ownerEmail}</p>
                  <p><strong>Phone:</strong> {pet.ownerPhone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Compliance Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(pet.complianceStatus)}`}>
                  {getStatusText(pet.complianceStatus)}
                </span>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => window.location.href = `/compliance/check/${pet.id}`}
                  className="w-full"
                >
                  Start Compliance Check
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{medicalRecords.length}</div>
            <p className="text-gray-600">Medical Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{complianceChecks.length}</div>
            <p className="text-gray-600">Compliance Checks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {medicalRecords.filter(r => r.status === 'active').length}
            </div>
            <p className="text-gray-600">Active Records</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMedical = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medical Records</h3>
        <Button variant="outline" size="sm">
          Upload New Record
        </Button>
      </div>
      
      <div className="space-y-4">
        {medicalRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getRecordTypeIcon(record.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{record.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{record.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Date: {record.date.toLocaleDateString()}</span>
                      {record.expirationDate && (
                        <span>Expires: {record.expirationDate.toLocaleDateString()}</span>
                      )}
                      <span>Uploaded by: {record.uploadedBy}</span>
                      <span>Uploaded: {record.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRecordStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                  {record.documentUrl && (
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Compliance History</h3>
        <Button 
          onClick={() => window.location.href = `/compliance/check/${pet.id}`}
        >
          New Compliance Check
        </Button>
      </div>
      
      <div className="space-y-4">
        {complianceChecks.map((check) => (
          <Card key={check.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium">Compliance Check #{check.id}</h4>
                  <p className="text-sm text-gray-600">
                    Performed by {check.performedBy} on {check.date.toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                  check.status === 'passed' ? 'bg-green-100 text-green-800 border-green-200' :
                  check.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                </span>
              </div>
              
              <div className="mb-4">
                <h5 className="font-medium mb-2">Requirements Checked:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {check.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        req.status === 'met' ? 'bg-green-500' :
                        req.status === 'not-met' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></span>
                      <span className="text-sm">{req.name}</span>
                      {req.notes && (
                        <span className="text-xs text-gray-500">({req.notes})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {check.notes && (
                <div>
                  <h5 className="font-medium mb-2">Notes:</h5>
                  <p className="text-sm text-gray-600">{check.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Staff Notes</h3>
        <Button variant="outline" size="sm">
          Export Notes
        </Button>
      </div>
      
      <div className="space-y-4">
        {pet.notes.map((note, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <p className="text-gray-700">{note}</p>
                <span className="text-xs text-gray-500">Note #{index + 1}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Note</CardTitle>
          <CardDescription>
            Add internal notes visible only to organization staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
            <div className="flex justify-end">
              <Button 
                onClick={addNote}
                disabled={!newNote.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              ← Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Pet Profile: {pet.name}
            </h1>
          </div>
          <p className="text-muted-foreground">
            View and manage pet records, medical documents, and compliance history
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'medical', label: 'Medical Records', icon: '🏥' },
              { id: 'compliance', label: 'Compliance', icon: '✅' },
              { id: 'notes', label: 'Staff Notes', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

                  {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'medical' && renderMedical()}
          {activeTab === 'compliance' && renderCompliance()}
          {activeTab === 'notes' && renderNotes()}
      </div>
    </div>
  );
}
