'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, UserPlus, Shield, Phone, MapPin, Clock, AlertCircle } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { toast } from '../../../hooks/use-toast';
import { cn } from '../../../lib/utils';

// Form interfaces
interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface VetDetailsForm {
  vetName: string;
  clinicName: string;
  tenureYears: number;
  tenureMonths: number;
  biography: string;
  specialty: string;
}

interface InviteUserForm {
  email: string;
  role: 'vet' | 'vet_nurse' | 'admin';
}

interface BusyTimeForm {
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}

// Validation functions
const validateEmail = (email: string) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) return 'Invalid email address';
  return true;
};

const validateRequired = (value: string, fieldName: string) => {
  if (!value || value.trim().length === 0) return `${fieldName} is required`;
  return true;
};

const validatePhone = (phone: string) => {
  if (!phone) return 'Phone number is required';
  if (phone.length < 10) return 'Phone number must be at least 10 digits';
  return true;
};

const validateTenureYears = (years: number) => {
  if (years < 0) return 'Tenure cannot be negative';
  return true;
};

const validateTenureMonths = (months: number) => {
  if (months < 0 || months > 11) return 'Months must be between 0-11';
  return true;
};

const validateBiography = (bio: string) => {
  if (bio && bio.length > 500) return 'Biography cannot exceed 500 characters';
  return true;
};

const validateTimeRange = (startTime: string, endTime: string) => {
  if (!startTime) return 'Start time is required';
  if (!endTime) return 'End time is required';
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  if (start >= end) return 'End time must be after start time';
  return true;
};

interface BusyTimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}

// Mock data - replace with actual data fetching
const mockUsers = [
  { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah@clinic.com', role: 'admin', isCurrentUser: true },
  { id: 2, name: 'Dr. Michael Chen', email: 'michael@clinic.com', role: 'vet', isCurrentUser: false },
  { id: 3, name: 'Jessica Brown', email: 'jessica@clinic.com', role: 'vet_nurse', isCurrentUser: false },
];

export default function SettingsView() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [busyTimeSlots, setBusyTimeSlots] = useState<BusyTimeSlot[]>([
    {
      id: '1',
      date: new Date(2024, 8, 20), // September 20, 2024
      startTime: '12:00',
      endTime: '13:00',
      reason: 'Lunch Break'
    },
    {
      id: '2',
      date: new Date(2024, 8, 22), // September 22, 2024
      startTime: '15:00',
      endTime: '16:30',
      reason: 'Staff Meeting'
    }
  ]);
  const [isCurrentUserAdmin] = useState(true); // Mock - replace with actual user role check

  // Personal Info Form
  const personalInfoForm = useForm<PersonalInfoForm>({
    mode: 'onChange',
    defaultValues: {
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@vetclinic.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, City, State 12345',
    },
  });

  // Vet Details Form
  const vetDetailsForm = useForm<VetDetailsForm>({
    mode: 'onChange',
    defaultValues: {
      vetName: 'Dr. Sarah Wilson',
      clinicName: 'Happy Paws Veterinary Clinic',
      tenureYears: 5,
      tenureMonths: 8,
      biography: 'Experienced veterinarian with a passion for animal care and specialized training in small animal medicine.',
      specialty: 'Small Animal Medicine',
    },
  });

  // Invite User Form
  const inviteUserForm = useForm<InviteUserForm>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'vet',
    },
  });

  // Busy Time Form
  const busyTimeForm = useForm<BusyTimeForm>({
    mode: 'onChange',
    defaultValues: {
      startTime: '',
      endTime: '',
      reason: '',
    },
  });

  const onPersonalInfoSubmit = (values: PersonalInfoForm) => {
    console.log('Personal info:', values);
    toast({
      title: "Personal information updated",
      description: "Your personal information has been successfully updated.",
    });
  };

  const onVetDetailsSubmit = (values: VetDetailsForm) => {
    console.log('Vet details:', values);
    toast({
      title: "Veterinarian details updated",
      description: "Your professional details have been successfully updated.",
    });
  };

  const onInviteUserSubmit = (values: InviteUserForm) => {
    console.log('Invite user:', values);
    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${values.email} as ${values.role}.`,
    });
    inviteUserForm.reset();
  };

  const onBusyTimeSubmit = (values: BusyTimeForm) => {
    const newBusySlot: BusyTimeSlot = {
      id: Date.now().toString(),
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      reason: values.reason,
    };
    
    setBusyTimeSlots([...busyTimeSlots, newBusySlot]);
    
    toast({
      title: "Busy time added",
      description: `Busy time slot has been added for ${format(values.date, 'MMM d, yyyy')}.`,
    });
    
    busyTimeForm.reset({
      startTime: '',
      endTime: '',
      reason: '',
    });
  };

  const handleRemoveUser = (userId: number) => {
    console.log('Remove user:', userId);
    toast({
      title: "User removed",
      description: "User has been successfully removed from the clinic.",
    });
  };

  const handlePromoteUser = (userId: number) => {
    console.log('Promote user:', userId);
    toast({
      title: "User promoted",
      description: "User has been promoted to admin status.",
    });
  };

  const handleRemoveBusyTime = (id: string) => {
    setBusyTimeSlots(busyTimeSlots.filter(slot => slot.id !== id));
    toast({
      title: "Busy time removed",
      description: "The busy time slot has been successfully removed.",
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          {isCurrentUserAdmin && <TabsTrigger value="calendar">Clinic Hours</TabsTrigger>}
          {isCurrentUserAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal contact information and details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalInfoForm.control}
                      name="firstName"
                      rules={{
                        validate: (value) => validateRequired(value, 'First name')
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="lastName"
                      rules={{
                        validate: (value) => validateRequired(value, 'Last name')
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="email"
                    rules={{
                      validate: validateEmail
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="phone"
                    rules={{
                      validate: validatePhone
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="address"
                    rules={{
                      validate: (value) => validateRequired(value, 'Address')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Personal Information</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Details Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Professional Details
              </CardTitle>
              <CardDescription>
                Manage your veterinary credentials and professional information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...vetDetailsForm}>
                <form onSubmit={vetDetailsForm.handleSubmit(onVetDetailsSubmit)} className="space-y-4">
                  <FormField
                    control={vetDetailsForm.control}
                    name="vetName"
                    rules={{
                      validate: (value) => validateRequired(value, 'Vet name')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={vetDetailsForm.control}
                    name="clinicName"
                    rules={{
                      validate: (value) => validateRequired(value, 'Clinic name')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Veterinary Clinic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={vetDetailsForm.control}
                      name="tenureYears"
                      rules={{
                        validate: validateTenureYears
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years at Clinic</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vetDetailsForm.control}
                      name="tenureMonths"
                      rules={{
                        validate: validateTenureMonths
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Months</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={vetDetailsForm.control}
                    name="specialty"
                    rules={{
                      validate: (value) => validateRequired(value, 'Specialty')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your specialty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Small Animal Medicine">Small Animal Medicine</SelectItem>
                            <SelectItem value="Large Animal Medicine">Large Animal Medicine</SelectItem>
                            <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                            <SelectItem value="Surgery">Surgery</SelectItem>
                            <SelectItem value="Dermatology">Dermatology</SelectItem>
                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                            <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                            <SelectItem value="Exotic Animals">Exotic Animals</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={vetDetailsForm.control}
                    name="biography"
                    rules={{
                      validate: validateBiography
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Biography</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your experience and background..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Professional Details</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic Hours Tab (Admin Only) */}
        {isCurrentUserAdmin && (
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Clinic Hours & Days Off
                </CardTitle>
                <CardDescription>
                  Set clinic operating hours and mark days when the clinic is closed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mark Days Off</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <Calendar
                      mode="single"
                      selected={undefined}
                      onSelect={handleDateSelect}
                      className="rounded-md border"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Selected Days Off:</h4>
                      {selectedDates.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedDates.map((date) => (
                            <Badge key={date.toISOString()} variant="secondary" className="flex items-center gap-1">
                              {format(date, 'MMM d, yyyy')}
                              <button 
                                onClick={() => handleDateSelect(date)}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No days off selected</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Busy Time Slots</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Busy Time Form */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Add Busy Time
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Block specific time slots when appointments cannot be booked.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...busyTimeForm}>
                          <form onSubmit={busyTimeForm.handleSubmit(onBusyTimeSubmit)} className="space-y-4">
                            <FormField
                              control={busyTimeForm.control}
                              name="date"
                              rules={{
                                required: 'Please select a date'
                              }}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                        className={cn("p-3 pointer-events-auto")}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={busyTimeForm.control}
                                name="startTime"
                                rules={{
                                  required: 'Start time is required',
                                  validate: (value) => {
                                    const endTime = busyTimeForm.getValues('endTime');
                                    if (endTime) {
                                      return validateTimeRange(value, endTime);
                                    }
                                    return true;
                                  }
                                }}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={busyTimeForm.control}
                                name="endTime"
                                rules={{
                                  required: 'End time is required',
                                  validate: (value) => {
                                    const startTime = busyTimeForm.getValues('startTime');
                                    if (startTime) {
                                      return validateTimeRange(startTime, value);
                                    }
                                    return true;
                                  }
                                }}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Time</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={busyTimeForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Lunch break, Staff meeting..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button type="submit" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Busy Time
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    {/* Current Busy Times */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Current Busy Times</CardTitle>
                        <CardDescription className="text-sm">
                          Scheduled time slots when appointments are blocked.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {busyTimeSlots.length > 0 ? (
                            busyTimeSlots
                              .sort((a, b) => a.date.getTime() - b.date.getTime())
                              .map((slot) => (
                                <div key={slot.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{format(slot.date, 'MMM d, yyyy')}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {slot.startTime} - {slot.endTime}
                                    </p>
                                    {slot.reason && (
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {slot.reason}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveBusyTime(slot.id)}
                                    className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                          ) : (
                            <p className="text-muted-foreground text-sm text-center py-8">
                              No busy time slots scheduled
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Regular Operating Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="space-y-2">
                        <label className="text-sm font-medium">{day}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="time" defaultValue="09:00" />
                          <Input type="time" defaultValue="17:00" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4">Save Operating Hours</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* User Management Tab (Admin Only) */}
        {isCurrentUserAdmin && (
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Invite New User */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Invite New User
                  </CardTitle>
                  <CardDescription>
                    Send an invitation to add a new member to your clinic.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...inviteUserForm}>
                    <form onSubmit={inviteUserForm.handleSubmit(onInviteUserSubmit)} className="space-y-4">
                      <FormField
                        control={inviteUserForm.control}
                        name="email"
                        rules={{
                          validate: validateEmail
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="user@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={inviteUserForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vet">Veterinarian</SelectItem>
                                <SelectItem value="vet_nurse">Veterinary Nurse</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Send Invitation
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Current Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Clinic Members
                  </CardTitle>
                  <CardDescription>
                    Manage existing clinic members and their permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.name}</p>
                            {user.isCurrentUser && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {user.role === 'vet' ? 'Veterinarian' : 
                             user.role === 'vet_nurse' ? 'Vet Nurse' : 'Administrator'}
                          </Badge>
                        </div>
                        
                        {!user.isCurrentUser && (
                          <div className="flex gap-2">
                            {user.role !== 'admin' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePromoteUser(user.id)}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
