'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PetData {
  petId: string;
  petName: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  owner?: string;
  age?: string;
  weight?: string;
  spayedNeutered?: string;
  allergies?: string;
}

interface PetTableData {
  table: PetData[];
  summary: {
    totalPets: number;
    averageWeight: number;
    genderDistribution: Record<string, number>;
    spayedNeuteredPercentage: number;
    petsWithAllergiesPercentage: number;
  };
}

export default function PetTable() {
  const [data, setData] = useState<PetTableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPetTable();
  }, []);

  const fetchPetTable = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/pet-table');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch pet table');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching pet table:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchPetTable();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pet Demographics Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pet Demographics Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pet Demographics Table</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data.summary.totalPets}</div>
            <p className="text-sm text-muted-foreground">Total Pets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data.summary.averageWeight} lbs</div>
            <p className="text-sm text-muted-foreground">Average Weight</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data.summary.spayedNeuteredPercentage}%</div>
            <p className="text-sm text-muted-foreground">Spayed/Neutered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data.summary.petsWithAllergiesPercentage}%</div>
            <p className="text-sm text-muted-foreground">With Allergies</p>
          </CardContent>
        </Card>
      </div>

      {/* Pet Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pet Demographics</CardTitle>
          <button 
            onClick={refreshData}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Pet Name</th>
                  <th className="text-left p-2">Breed</th>
                  <th className="text-left p-2">Date of Birth</th>
                  <th className="text-left p-2">Gender</th>
                  <th className="text-left p-2">Weight</th>
                  <th className="text-left p-2">Spayed/Neutered</th>
                  <th className="text-left p-2">Allergies</th>
                </tr>
              </thead>
              <tbody>
                {data.table.map((pet) => (
                  <tr key={pet.petId} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{pet.petName}</td>
                    <td className="p-2">{pet.breed}</td>
                    <td className="p-2">{pet.dateOfBirth}</td>
                    <td className="p-2">
                      <Badge variant={pet.gender === 'male' ? 'default' : 'secondary'}>
                        {pet.gender}
                      </Badge>
                    </td>
                    <td className="p-2">{pet.weight}</td>
                    <td className="p-2">
                      <Badge variant={pet.spayedNeutered === 'Yes' ? 'default' : 'outline'}>
                        {pet.spayedNeutered}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {pet.allergies && pet.allergies !== 'None' ? (
                        <Badge variant="destructive" className="text-xs">
                          {pet.allergies}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gender Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Object.entries(data.summary.genderDistribution).map(([gender, count]) => (
              <div key={gender} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-sm text-muted-foreground capitalize">{gender}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
