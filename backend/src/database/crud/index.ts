import * as fs from 'fs/promises';
import * as path from 'path';
import { User, Pet, MedicalRecord, Task, Appointment } from '../entities/index.js';

// Utility function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Utility function to ensure directory exists
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

// Utility function to check if path exists
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Utility function to read JSON file
async function readJson(filePath: string): Promise<any> {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

// Utility function to write JSON file
async function writeJson(filePath: string, data: any, options?: { spaces?: number }): Promise<void> {
  const jsonString = JSON.stringify(data, null, options?.spaces || 0);
  await fs.writeFile(filePath, jsonString, 'utf-8');
}


export type TableName = 'users' | 'pets' | 'medicalRecords' | 'tasks' | 'appointments' | 'clinics' | 'vetProfiles' | 'notifications';

export interface DatabaseConfig {
  dataDir: string;
}

export class LocalDatabase {
  private dataDir: string;
  private cache: Map<string, any> = new Map();
  private initialized: boolean = false;

  constructor(config: DatabaseConfig) {
    this.dataDir = config.dataDir;
  }

  private async initializeDataDirectory(): Promise<void> {
    if (this.initialized) return;
    
    await ensureDir(this.dataDir);
    
    // Create initial table files if they don't exist
    const tables: TableName[] = ['users', 'pets', 'medicalRecords', 'tasks', 'appointments', 'clinics', 'vetProfiles', 'notifications'];
    
    for (const table of tables) {
      const filePath = path.join(this.dataDir, `${table}.json`);
      if (!(await pathExists(filePath))) {
        await writeJson(filePath, []);
      }
    }
    
    this.initialized = true;
  }

  private getFilePath(tableName: TableName): string {
    return path.join(this.dataDir, `${tableName}.json`);
  }

  private async readTable<T>(tableName: TableName): Promise<T[]> {
    await this.initializeDataDirectory();
    
    const cacheKey = tableName;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as T[];
    }

    const filePath = this.getFilePath(tableName);
    const data = await readJson(filePath) as T[];
    this.cache.set(cacheKey, data);
    return data;
  }

  private async writeTable<T>(tableName: TableName, data: T[]): Promise<void> {
    await this.initializeDataDirectory();
    
    const filePath = this.getFilePath(tableName);
    await writeJson(filePath, data, { spaces: 2 });
    this.cache.set(tableName, data);
  }

  // Generic CRUD operations
  async create<T extends Record<string, any>>(tableName: TableName, item: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T> {
    const data = await this.readTable<T>(tableName);
    const now = new Date().toISOString();
    
    const newItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    // Generate ID if not provided
    const idField = this.getIdField(tableName);
    if (!(newItem as any)[idField]) {
      (newItem as any)[idField] = generateId();
    }

    data.push(newItem);
    await this.writeTable(tableName, data);
    return newItem;
  }

  async findById<T extends Record<string, any>>(tableName: TableName, id: string): Promise<T | null> {
    const data = await this.readTable<T>(tableName);
    const idField = this.getIdField(tableName);
    return data.find(item => (item as any)[idField] === id) || null;
  }

  async findAll<T>(tableName: TableName): Promise<T[]> {
    return await this.readTable<T>(tableName);
  }

  async findWhere<T>(tableName: TableName, predicate: (item: T) => boolean): Promise<T[]> {
    const data = await this.readTable<T>(tableName);
    return data.filter(predicate);
  }

  async update<T extends Record<string, any>>(tableName: TableName, id: string, updates: Partial<T>): Promise<T | null> {
    const data = await this.readTable<T>(tableName);
    const idField = this.getIdField(tableName);
    const index = data.findIndex(item => (item as any)[idField] === id);
    
    if (index === -1) return null;

    const updatedItem = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T;

    data[index] = updatedItem;
    await this.writeTable(tableName, data);
    return updatedItem;
  }

  async delete(tableName: TableName, id: string): Promise<boolean> {
    const data = await this.readTable<Record<string, any>>(tableName);
    const idField = this.getIdField(tableName);
    const initialLength = data.length;
    
    const filteredData = data.filter(item => (item as any)[idField] !== id);
    
    if (filteredData.length === initialLength) return false;
    
    await this.writeTable(tableName, filteredData);
    return true;
  }

  private getIdField(tableName: TableName): string {
    const idFields: Record<TableName, string> = {
      users: 'petOwnerId',
      pets: 'petId',
      medicalRecords: 'recordId',
      tasks: 'taskId',
      appointments: 'appointmentId',
      clinics: 'clinicId',
      vetProfiles: 'vetId',
      notifications: 'notificationId',
    };
    return idFields[tableName];
  }

  // Convenient typed methods
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    return await this.create<User>('users', user);
  }

  async createPet(pet: Omit<Pet, 'createdAt' | 'updatedAt'>): Promise<Pet> {
    return await this.create<Pet>('pets', pet);
  }

  async createTask(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<Task> {
    return await this.create<Task>('tasks', task);
  }

  async createAppointment(appointment: Omit<Appointment, 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return await this.create<Appointment>('appointments', appointment);
  }

  async getPetsByOwner(ownerId: string): Promise<Pet[]> {
    return await this.findWhere<Pet>('pets', pet => pet.ownerId === ownerId);
  }

  async getTasksByPet(petId: string): Promise<Task[]> {
    return await this.findWhere<Task>('tasks', task => task.petId === petId);
  }

  async getAppointmentsByOwner(petOwnerId: string): Promise<Appointment[]> {
    return await this.findWhere<Appointment>('appointments', appointment => appointment.petOwnerId === petOwnerId);
  }

  async getMedicalRecordsByPet(petId: string): Promise<MedicalRecord[]> {
    return await this.findWhere<MedicalRecord>('medicalRecords', record => record.petId === petId);
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache.clear();
  }
}

// Create default instance
const defaultDb = new LocalDatabase({
  dataDir: path.join(process.cwd(), 'data', 'local-db')
});

export default defaultDb; 