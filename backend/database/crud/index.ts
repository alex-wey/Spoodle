import * as fs from 'fs-extra';
import * as path from 'path';
import { User, Pet, MedicalRecord, Task, Appointment } from '../entities/index';


export type TableName = 'users' | 'pets' | 'medicalRecords' | 'tasks' | 'appointments' | 'clinics' | 'vetProfiles' | 'notifications';

export interface DatabaseConfig {
  dataDir: string;
}

export class LocalDatabase {
  private dataDir: string;
  private cache: Map<string, any> = new Map();

  constructor(config: DatabaseConfig) {
    this.dataDir = config.dataDir;
    this.initializeDataDirectory();
  }

  private async initializeDataDirectory(): Promise<void> {
    await fs.ensureDir(this.dataDir);
    
    // Create initial table files if they don't exist
    const tables: TableName[] = ['users', 'pets', 'medicalRecords', 'tasks', 'appointments', 'clinics', 'vetProfiles', 'notifications'];
    
    for (const table of tables) {
      const filePath = path.join(this.dataDir, `${table}.json`);
      if (!(await fs.pathExists(filePath))) {
        await fs.writeJson(filePath, []);
      }
    }
  }

  private getFilePath(tableName: TableName): string {
    return path.join(this.dataDir, `${tableName}.json`);
  }

  private async readTable<T>(tableName: TableName): Promise<T[]> {
    const cacheKey = tableName;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const filePath = this.getFilePath(tableName);
    const data = await fs.readJson(filePath);
    this.cache.set(cacheKey, data);
    return data;
  }

  private async writeTable<T>(tableName: TableName, data: T[]): Promise<void> {
    const filePath = this.getFilePath(tableName);
    await fs.writeJson(filePath, data, { spaces: 2 });
    this.cache.set(tableName, data);
  }

  // Generic CRUD operations
  async create<T extends { [key: string]: any }>(tableName: TableName, item: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T> {
    const data = await this.readTable<T>(tableName);
    const now = new Date().toISOString();
    
    const newItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
    } as T;

    // Generate ID if not provided
    const idField = this.getIdField(tableName);
    if (!newItem[idField]) {
      newItem[idField] = generateId();
    }

    data.push(newItem);
    await this.writeTable(tableName, data);
    return newItem;
  }

  async findById<T>(tableName: TableName, id: string): Promise<T | null> {
    const data = await this.readTable<T>(tableName);
    const idField = this.getIdField(tableName);
    return data.find(item => item[idField] === id) || null;
  }

  async findAll<T>(tableName: TableName): Promise<T[]> {
    return await this.readTable<T>(tableName);
  }

  async findWhere<T>(tableName: TableName, predicate: (item: T) => boolean): Promise<T[]> {
    const data = await this.readTable<T>(tableName);
    return data.filter(predicate);
  }

  async update<T>(tableName: TableName, id: string, updates: Partial<T>): Promise<T | null> {
    const data = await this.readTable<T>(tableName);
    const idField = this.getIdField(tableName);
    const index = data.findIndex(item => item[idField] === id);
    
    if (index === -1) return null;

    const updatedItem = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    data[index] = updatedItem;
    await this.writeTable(tableName, data);
    return updatedItem;
  }

  async delete(tableName: TableName, id: string): Promise<boolean> {
    const data = await this.readTable(tableName);
    const idField = this.getIdField(tableName);
    const initialLength = data.length;
    
    const filteredData = data.filter(item => item[idField] !== id);
    
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
  async createUser(user: Omit<User, 'petOwnerId' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return await this.create<User>('users', user);
  }

  async createPet(pet: Omit<Pet, 'petId' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    return await this.create<Pet>('pets', pet);
  }

  async createTask(task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return await this.create<Task>('tasks', task);
  }

  async createAppointment(appointment: Omit<Appointment, 'appointmentId' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
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