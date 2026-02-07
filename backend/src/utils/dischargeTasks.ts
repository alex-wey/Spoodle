import { prisma } from '../index.js';

/**
 * Parsed medication information from discharge form
 */
interface ParsedMedication {
  name: string;
  dosage: string;
  totalQuantity: number; // Total number of pills/tabs or volume
  dosePerAdmin: number; // How many pills/tabs or volume per dose (e.g., 1, 0.5, 2)
  doseUnit: string; // tablet(s), capsule(s), ml, etc.
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'every_8_hours' | 'every_12_hours' | 'as_needed';
  instructions: string; // Full instruction text
  duration?: string; // Optional: duration (e.g., "5 days", "2 weeks")
  startTime?: string; // Optional: specific start time (e.g., "19:00")
}

/**
 * Parse medication instruction text to extract prescription details
 * Examples:
 * - "Carprofen 75mg #10 tabs, Give 1 tab orally twice daily until finished, start tonight. Give with food."
 * - "Carprofen 75mg #5 tabs, Give 1/2 tab orally twice daily until finished"
 * - "Cephalexin 500mg #20 tabs, Give 1 tab PO BID starting tonight. Give with food."
 */
function parseMedicationInstruction(instruction: string): ParsedMedication | null {
  if (!instruction || typeof instruction !== 'string') return null;

  const text = instruction.trim();
  if (!text) return null;

  console.log(`   🔍 Parsing medication: "${text.substring(0, 100)}"`);

  // Extract medication name (usually first word before dosage)
  const nameMatch = text.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)/);
  const name = nameMatch && nameMatch[1] ? nameMatch[1] : 'Medication';
  console.log(`   📝 Extracted name: "${name}"`);

  // Extract total quantity (#10, #5, #20, etc.)
  const quantityMatch = text.match(/#(\d+)/);
  const totalQuantity = quantityMatch && quantityMatch[1] ? parseInt(quantityMatch[1], 10) : 0;
  console.log(`   📦 Extracted quantity: ${totalQuantity}`);

  // Extract dose per administration (1 tab, 1/2 tab, 2 tabs, etc.)
  // Look for the dose AFTER keywords like "Give" or "Take" to avoid matching the total quantity (#10 tabs)
  let dosePerAdmin = 1;
  const dosePatterns = [
    // Pattern 1: "Give 1 tab" or "Take 1/2 tablet"
    /(?:give|take|administer)\s+(\d+(?:\/\d+)?)\s*(?:tab|tabs|tablet|tablets|pill|pills|cap|caps|capsule|capsules)/i,
    // Pattern 2: After comma, "Give 1 tab orally"
    /,\s*(?:give|take)\s+(\d+(?:\/\d+)?)\s*(?:tab|tabs|tablet|tablets|pill|pills)/i,
    // Pattern 3: "1 tab orally" or "1 tab PO" (after any word boundary)
    /\b(\d+(?:\/\d+)?)\s*(?:tab|tabs|tablet|tablets)\s*(?:orally|po|by mouth)/i,
    // Pattern 4: Last resort - find dose pattern, but not immediately after # symbol
    /[^#](\d+(?:\/\d+)?)\s*(?:tab|tabs)/i,
  ];
  
  console.log(`   🔍 Trying to extract dose from: "${text.substring(0, 120)}"`);
  
  for (const pattern of dosePatterns) {
    const doseMatch = text.match(pattern);
    if (doseMatch && doseMatch[1]) {
      const doseStr = doseMatch[1];
      console.log(`   ✓ Dose pattern matched: "${doseMatch[0]}" -> extracted: "${doseStr}"`);
      
      if (doseStr.includes('/')) {
        const parts = doseStr.split('/').map(Number);
        const num = parts[0];
        const den = parts[1];
        if (num !== undefined && den && den > 0) {
          dosePerAdmin = num / den;
          break;
        }
      } else {
        const parsed = parseInt(doseStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          dosePerAdmin = parsed;
          break;
        }
      }
    }
  }
  
  console.log(`   → Final dose per admin: ${dosePerAdmin}`);

  // Determine frequency
  let frequency: ParsedMedication['frequency'] = 'twice_daily';
  const lowerText = text.toLowerCase();
  if (lowerText.includes('once daily') || lowerText.includes('once a day') || lowerText.includes('qd')) {
    frequency = 'once_daily';
  } else if (lowerText.includes('twice daily') || lowerText.includes('bid') || lowerText.includes('b.i.d.')) {
    frequency = 'twice_daily';
  } else if (lowerText.includes('three times daily') || lowerText.includes('tid') || lowerText.includes('t.i.d.')) {
    frequency = 'three_times_daily';
  } else if (lowerText.includes('every 8 hours') || lowerText.includes('q8h') || lowerText.includes('q8hrs')) {
    frequency = 'every_8_hours';
  } else if (lowerText.includes('every 12 hours') || lowerText.includes('q12h') || lowerText.includes('q12hrs')) {
    frequency = 'every_12_hours';
  } else if (lowerText.includes('as needed') || lowerText.includes('prn')) {
    frequency = 'as_needed';
  }

  const dosageMatch = text.match(/\d+\s*mg/i);
  console.log(`   💊 Dose per admin: ${dosePerAdmin}, Frequency: ${frequency}`);
  
  // Extract unit from text (default to tablet(s))
  let doseUnit = 'tablet(s)';
  if (text.match(/\bcap(?:s|sule|sules)?\b/i)) {
    doseUnit = 'capsule(s)';
  } else if (text.match(/\bml\b/i)) {
    doseUnit = 'ml';
  } else if (text.match(/\btsp|teaspoon/i)) {
    doseUnit = 'teaspoon(s)';
  } else if (text.match(/\bdrops?\b/i)) {
    doseUnit = 'drops';
  }
  
  return {
    name,
    dosage: dosageMatch && dosageMatch[0] ? dosageMatch[0] : '',
    totalQuantity,
    dosePerAdmin,
    doseUnit,
    frequency,
    instructions: text,
  };
}

/**
 * Extract medications when Tally sends repeated sections as arrays
 * (When multiple medication sections all have the same field name)
 */
function extractArrayBasedMedications(answers: any): ParsedMedication[] {
  const medications: ParsedMedication[] = [];
  
  // Check if medication fields are arrays (Tally's repeated section format)
  const names = answers['Name'] || answers['name'] || answers['Medication Name'];
  
  if (!Array.isArray(names)) {
    return []; // Not array-based, return empty
  }
  
  console.log(`   🔍 Found array-based medication data with ${names.length} medication(s)`);
  console.log(`   📋 Names array:`, names);
  
  // Get all field arrays
  const strengths = answers['Strength/Dosage'] || answers['strength/dosage'] || [];
  const quantities = answers['Total quantity dispensed'] || answers['total quantity dispensed'] || [];
  const doseAmounts = answers['Dose amount'] || answers['dose amount'] || [];
  const doseUnits = answers['Dose unit'] || answers['dose unit'] || [];
  const frequencies = answers['Frequency'] || answers['frequency'] || [];
  const routes = answers['Route of administration'] || answers['route of administration'] || [];
  const prescriptionLabels = answers['Prescription label'] || answers['prescription label'] || [];
  
  console.log(`   📋 Arrays: strengths=${Array.isArray(strengths)}, quantities=${Array.isArray(quantities)}, doseAmounts=${Array.isArray(doseAmounts)}, doseUnits=${Array.isArray(doseUnits)}, frequencies=${Array.isArray(frequencies)}`);
  
  // Iterate through each medication
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    
    if (!name || !name.trim()) {
      console.log(`   ⏭️ Medication ${i + 1}: Empty name, skipping`);
      continue;
    }
    
    const strength = strengths[i] || '';
    const quantityStr = quantities[i];
    const doseAmountStr = doseAmounts[i];
    const doseUnit = doseUnits[i];
    const frequencyStr = frequencies[i];
    const route = routes[i] || '';
    const instructions = prescriptionLabels[i] || '';
    
    // Validate required fields
    if (!quantityStr || !doseAmountStr || !frequencyStr) {
      console.log(`   ⚠️ Medication ${i + 1} (${name}): Missing required fields, skipping`);
      continue;
    }
    
    console.log(`   ✅ Processing Medication ${i + 1}:`, { 
      name, 
      strength, 
      quantityStr: `${quantityStr} (type: ${typeof quantityStr})`, 
      doseAmountStr: `${doseAmountStr} (type: ${typeof doseAmountStr})`, 
      doseUnit: `${doseUnit} (type: ${typeof doseUnit})`, 
      frequencyStr: `${frequencyStr} (type: ${typeof frequencyStr})` 
    });
    
    // Parse total quantity
    const totalQuantity = parseInt(String(quantityStr), 10);
    if (isNaN(totalQuantity) || totalQuantity <= 0) {
      console.log(`   ⚠️ Medication ${i + 1}: Invalid quantity: ${quantityStr}`);
      continue;
    }
    console.log(`   ✓ Total quantity parsed: ${totalQuantity}`);
    
    // Parse dose amount (can be "1", "0.5", "1/2", etc.)
    let dosePerAdmin = 1;
    const doseStr = String(doseAmountStr).trim();
    if (doseStr.includes('/')) {
      const parts = doseStr.split('/').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && parts[0] && parts[1]) {
        dosePerAdmin = parts[0] / parts[1];
      }
    } else {
      const parsed = parseFloat(doseStr);
      if (!isNaN(parsed) && parsed > 0) {
        dosePerAdmin = parsed;
      }
    }
    
    // Map frequency (SID/BID/TID)
    let frequency: ParsedMedication['frequency'] = 'twice_daily';
    const freqLower = String(frequencyStr).toLowerCase();
    
    if (freqLower.includes('sid') || freqLower.includes('once')) {
      frequency = 'once_daily';
    } else if (freqLower.includes('bid') || freqLower.includes('twice')) {
      frequency = 'twice_daily';
    } else if (freqLower.includes('tid') || freqLower.includes('three')) {
      frequency = 'three_times_daily';
    } else if (freqLower.includes('qid') || freqLower.includes('four')) {
      frequency = 'every_8_hours';
    } else if (freqLower.includes('prn') || freqLower.includes('as needed')) {
      frequency = 'as_needed';
    }
    
    console.log(`   📊 Parsed Medication ${i + 1}: ${name} - ${totalQuantity} total, ${dosePerAdmin} per dose, ${frequency}`);
    
    medications.push({
      name,
      dosage: strength || '',
      totalQuantity,
      dosePerAdmin,
      doseUnit: doseUnit || 'tablet(s)',
      frequency,
      instructions: instructions || `${name} ${strength || ''} ${route ? `(${route})` : ''} - Give ${doseAmountStr} ${doseUnit || 'tablet(s)'} ${frequencyStr}`,
    });
  }
  
  return medications;
}

/**
 * Extract structured medication data from form fields (new structured form format)
 * Supports unlimited medications (Medication 1, Medication 2, Medication 3, ...)
 */
function extractStructuredMedications(answers: any): ParsedMedication[] {
  const medications: ParsedMedication[] = [];
  
  // Try to extract medications dynamically - loop until we stop finding them
  let i = 1;
  let maxAttempts = 20; // Safety limit to prevent infinite loops
  let consecutiveMissing = 0;
  
  while (i <= maxAttempts && consecutiveMissing < 2) {
    const prefix = i === 1 ? '' : ` ${i}`; // "Medication Name" for first, "Medication Name 2" for second, etc.
    
    // Check for medication fields with and without number suffix
    const nameKey = i === 1 ? 'Medication Name' : `Medication ${i} Name`;
    const strengthKey = i === 1 ? 'Strength/Dosage' : `Medication ${i} Strength/Dosage`;
    const quantityKey = i === 1 ? 'Total quantity dispensed' : `Medication ${i} Total quantity dispensed`;
    const doseAmountKey = i === 1 ? 'Dose amount' : `Medication ${i} Dose amount`;
    const doseUnitKey = i === 1 ? 'Dose unit' : `Medication ${i} Dose unit`;
    const frequencyKey = i === 1 ? 'Frequency' : `Medication ${i} Frequency`;
    const routeKey = i === 1 ? 'Route of administration' : `Medication ${i} Route of administration`;
    const instructionsKey = i === 1 ? 'Prescription label' : `Medication ${i} Prescription label`;
    
    const name = answers[nameKey] || answers[nameKey.toLowerCase()];
    const strength = answers[strengthKey] || answers[strengthKey.toLowerCase()];
    const quantityStr = answers[quantityKey] || answers[quantityKey.toLowerCase()];
    const doseAmountStr = answers[doseAmountKey] || answers[doseAmountKey.toLowerCase()];
    const doseUnit = answers[doseUnitKey] || answers[doseUnitKey.toLowerCase()];
    const frequencyStr = answers[frequencyKey] || answers[frequencyKey.toLowerCase()];
    const route = answers[routeKey] || answers[routeKey.toLowerCase()];
    const instructions = answers[instructionsKey] || answers[instructionsKey.toLowerCase()] || '';

    // If name is missing, skip this medication (it's not filled)
    if (!name) {
      console.log(`   ⏭️ Medication ${i}: No name found, skipping`);
      consecutiveMissing++;
      i++;
      continue;
    }
    
    // Reset consecutive missing counter when we find a medication
    consecutiveMissing = 0;
    
    // If other required fields are missing, log warning but continue
    if (!quantityStr || !doseAmountStr || !frequencyStr) {
      console.log(`   ⚠️ Medication ${i} (${name}): Missing required fields, skipping`);
      i++;
      continue;
    }

    console.log(`   ✅ Found Medication ${i} data:`, { name, strength, quantityStr, doseAmountStr, doseUnit, frequencyStr, route });

    // Parse total quantity
    const totalQuantity = parseInt(String(quantityStr), 10);
    if (isNaN(totalQuantity) || totalQuantity <= 0) {
      console.log(`   ⚠️ Medication ${i}: Invalid total quantity: ${quantityStr}`);
      continue;
    }

    // Parse dose amount (can be "1", "0.5", "1/2", etc.)
    let dosePerAdmin = 1;
    const doseStr = String(doseAmountStr).trim();
    if (doseStr.includes('/')) {
      // Handle fractions like "1/2"
      const parts = doseStr.split('/').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && parts[0] && parts[1]) {
        dosePerAdmin = parts[0] / parts[1];
      }
    } else {
      const parsed = parseFloat(doseStr);
      if (!isNaN(parsed) && parsed > 0) {
        dosePerAdmin = parsed;
      }
    }

    // Map frequency dropdown value to internal frequency code (now using SID/BID/TID)
    let frequency: ParsedMedication['frequency'] = 'twice_daily'; // default
    const freqLower = String(frequencyStr).toLowerCase();
    
    if (freqLower.includes('sid') || freqLower.includes('once')) {
      frequency = 'once_daily';
    } else if (freqLower.includes('bid') || freqLower.includes('twice')) {
      frequency = 'twice_daily';
    } else if (freqLower.includes('tid') || freqLower.includes('three')) {
      frequency = 'three_times_daily';
    } else if (freqLower.includes('qid') || freqLower.includes('four')) {
      frequency = 'every_8_hours'; // Using every_8_hours as closest match for QID (actually 6h but we'll treat as 4x/day)
    } else if (freqLower.includes('prn') || freqLower.includes('as needed')) {
      frequency = 'as_needed';
    }

    console.log(`   📊 Parsed Medication ${i}: ${name} - ${totalQuantity} total, ${dosePerAdmin} per dose, ${frequency}`);

    medications.push({
      name,
      dosage: strength || '',
      totalQuantity,
      dosePerAdmin,
      doseUnit: doseUnit || 'tablet(s)',
      frequency,
      instructions: instructions || `${name} ${strength || ''} ${route ? `(${route})` : ''} - Give ${doseAmountStr} ${doseUnit || 'tablet(s)'} ${frequencyStr}`,
    });
    
    i++; // Move to next medication
  }
  
  console.log(`   🔍 Total medications found: ${medications.length}`);
  return medications;
}

/**
 * Calculate number of doses and duration in days from medication info
 */
function calculateMedicationSchedule(med: ParsedMedication): { totalDoses: number; durationDays: number } {
  if (med.totalQuantity === 0 || med.dosePerAdmin === 0) {
    return { totalDoses: 0, durationDays: 0 };
  }

  const totalDoses = Math.floor(med.totalQuantity / med.dosePerAdmin);
  
  let dosesPerDay = 1;
  switch (med.frequency) {
    case 'once_daily':
      dosesPerDay = 1;
      break;
    case 'twice_daily':
    case 'every_12_hours':
      dosesPerDay = 2;
      break;
    case 'three_times_daily':
      dosesPerDay = 3;
      break;
    case 'every_8_hours':
      dosesPerDay = 3;
      break;
    case 'as_needed':
      dosesPerDay = 1; // Conservative estimate
      break;
  }

  const durationDays = Math.ceil(totalDoses / dosesPerDay);
  return { totalDoses, durationDays };
}

/**
 * Extract discharge date/time from form answers
 */
function extractDischargeDateTime(answers: any): { dischargeDate: Date; firstEveningTime: string } {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Try to find discharge date from form
  let dischargeDate = today;
  const dateFields = ['dischargeDate', 'date', 'surgeryDate', 'procedureDate', 'todayDate'];
  for (const field of dateFields) {
    const value = answers[field]?.value || answers[field];
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        dischargeDate = parsed;
        dischargeDate.setUTCHours(0, 0, 0, 0);
        break;
      }
    }
  }

  // Extract first evening dose time (default: 7pm, or 2 hours after discharge if discharge time provided)
  let firstEveningTime: string = '19:00'; // Default 7pm with explicit type
  const timeFields = ['firstEveningTime', 'firstDoseTime', 'dischargeTime'];
  for (const field of timeFields) {
    const value = answers[field]?.value || answers[field];
    if (value && typeof value === 'string') {
      // Try to parse time (HH:MM format)
      const timeMatch = value.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        firstEveningTime = value;
        break;
      }
    }
  }

  // If discharge time is provided, calculate first evening time as 2 hours later
  const dischargeTimeField = answers['dischargeTime']?.value || answers['dischargeTime'];
  if (dischargeTimeField && typeof dischargeTimeField === 'string') {
    const timeMatch = dischargeTimeField.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch && timeMatch[1] && timeMatch[2]) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const dischargeDateTime = new Date(dischargeDate);
        dischargeDateTime.setUTCHours(hours, minutes, 0, 0);
        dischargeDateTime.setUTCHours(dischargeDateTime.getUTCHours() + 2); // Add 2 hours
        firstEveningTime = `${dischargeDateTime.getUTCHours().toString().padStart(2, '0')}:${dischargeDateTime.getUTCMinutes().toString().padStart(2, '0')}`;
      }
    }
  }

  return { dischargeDate, firstEveningTime };
}

/**
 * Create tasks from discharge form submission
 */
export async function createTasksFromDischarge(
  petId: string,
  answers: any,
  petName: string
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  try {
    console.log('🔍 [DischargeTasks] Starting task creation for pet:', petId);
    console.log('🔍 [DischargeTasks] Available answer keys:', Object.keys(answers || {}));
    
    const { dischargeDate, firstEveningTime } = extractDischargeDateTime(answers);
    console.log('🔍 [DischargeTasks] Discharge date:', dischargeDate, 'First evening time:', firstEveningTime);

    // First, try to extract structured medication data (new form format with multiple medications)
    let medications: ParsedMedication[] = [];
    
    console.log('🔍 [DischargeTasks] Attempting to extract structured medication data...');
    
    // Try array-based format first (Tally repeated sections with same field names)
    const arrayBasedMeds = extractArrayBasedMedications(answers);
    if (arrayBasedMeds.length > 0) {
      console.log(`✅ [DischargeTasks] Found ${arrayBasedMeds.length} medication(s) in array format`);
      medications = arrayBasedMeds;
    } else {
      // Try numbered format (Medication 1, Medication 2, Medication 3, etc.)
      const structuredMeds = extractStructuredMedications(answers);
      if (structuredMeds.length > 0) {
        console.log(`✅ [DischargeTasks] Found ${structuredMeds.length} structured medication(s)`);
        medications = structuredMeds;
      }
    }
    
    if (medications.length === 0) {
      console.log('⚠️ [DischargeTasks] No structured medication data found, trying text parsing...');
      
      // Fallback: Parse medications from text fields (old form format)
      const medicationFields = [
        'Medications', 'medications', 
        'Medication', 'medication',
        'Prescriptions', 'prescriptions', 
        'Prescription', 'prescription', 
        'Meds', 'meds',
        'Discharge Instructions', 'discharge instructions'
      ];

      for (const field of medicationFields) {
        const value = answers[field] || answers[field.toLowerCase()];
        if (value) {
          console.log(`✅ [DischargeTasks] Found medication field "${field}":`, typeof value === 'string' ? value.substring(0, 100) : value);
          if (typeof value === 'string') {
            // Single medication or newline-separated list
            const medStrings = value.split('\n').filter(s => s.trim());
            for (const medStr of medStrings) {
              const parsed = parseMedicationInstruction(medStr);
              if (parsed) {
                console.log(`   📊 Parsed: ${parsed.name} - ${parsed.totalQuantity} total, ${parsed.dosePerAdmin} per dose, ${parsed.frequency}`);
                medications.push(parsed);
              }
            }
          } else if (Array.isArray(value)) {
            // Array of medications
            for (const medItem of value) {
              const medStr = typeof medItem === 'string' ? medItem : JSON.stringify(medItem);
              const parsed = parseMedicationInstruction(medStr);
              if (parsed) medications.push(parsed);
            }
          }
          // Break after finding first matching field to avoid duplicates
          break;
        }
      }
    }

    // Create medication tasks
    console.log(`🔍 [DischargeTasks] Creating tasks for ${medications.length} medication(s)...`);
    for (const med of medications) {
      try {
        console.log(`   🔄 Processing medication: ${med.name}`);
        const { totalDoses, durationDays } = calculateMedicationSchedule(med);
        console.log(`   📊 Schedule calculated: ${totalDoses} doses over ${durationDays} days`);
        if (totalDoses === 0) {
          console.log(`   ⚠️ Skipping ${med.name}: totalDoses is 0`);
          continue;
        }

        // Determine recurrence pattern
        let recurrencePattern: string | null = null;
        let recurrenceTimes: string[] = [];
        let recurrenceEndDate: Date | null = null;

        const eveningTime = firstEveningTime || '19:00'; // Fallback to 7pm
        
        switch (med.frequency) {
          case 'once_daily':
            recurrencePattern = 'daily';
            recurrenceTimes = [eveningTime];
            recurrenceEndDate = new Date(dischargeDate);
            recurrenceEndDate.setUTCDate(recurrenceEndDate.getUTCDate() + durationDays - 1);
            break;
          case 'twice_daily':
          case 'every_12_hours':
            recurrencePattern = 'daily';
            // Default to 7am and 7pm, but use firstEveningTime for first evening dose
            const morningTime = '07:00';
            recurrenceTimes = [morningTime, eveningTime];
            recurrenceEndDate = new Date(dischargeDate);
            recurrenceEndDate.setUTCDate(recurrenceEndDate.getUTCDate() + durationDays - 1);
            break;
          case 'three_times_daily':
          case 'every_8_hours':
            recurrencePattern = 'daily';
            recurrenceTimes = ['08:00', '14:00', eveningTime];
            recurrenceEndDate = new Date(dischargeDate);
            recurrenceEndDate.setUTCDate(recurrenceEndDate.getUTCDate() + durationDays - 1);
            break;
        }

        // Create recurring task (don't create a separate first task)
        // The recurring task will handle all occurrences including the first one
        const firstDoseDate = new Date(dischargeDate);
        const timeParts = firstEveningTime.split(':');
        const firstHours = parseInt(timeParts[0] || '19', 10);
        const firstMinutes = parseInt(timeParts[1] || '0', 10);
        firstDoseDate.setUTCHours(firstHours, firstMinutes, 0, 0);

        // Build title with dose information in instruction format
        const unit = med.doseUnit || 'tab';
        const doseInfo = `${med.dosePerAdmin} ${unit}`;
        const title = `Give ${med.name} ${doseInfo}${med.dosage ? ` (${med.dosage})` : ''}`;

        await prisma.task.create({
          data: {
            petId,
            taskType: 'medication',
            title,
            description: med.instructions,
            scheduledDate: firstDoseDate,
            scheduledTime: firstEveningTime,
            recurring: recurrencePattern !== null,
            recurrencePattern,
            recurrenceTimes: recurrenceTimes.length > 0 ? JSON.stringify(recurrenceTimes) : null,
            recurrenceEndDate,
            completed: false,
          },
        });
        created++;

        console.log(`✅ Created medication task: ${med.name} (${totalDoses} doses over ${durationDays} days)`);
      } catch (medErr: any) {
        const errorMsg = `Failed to create task for medication ${med.name}: ${medErr.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`, medErr);
      }
    }

    // Create feeding task (first night: half meal)
    const feedingFields = ['Feeding', 'feeding', 'Feeding Instructions', 'feedingInstructions', 'Diet', 'diet', 'Food', 'food'];
    let hasFeedingTask = false;
    for (const field of feedingFields) {
      const value = answers[field] || answers[field.toLowerCase()];
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`✅ [DischargeTasks] Found feeding field "${field}"`);
        const feedingTime = new Date(dischargeDate);
        feedingTime.setUTCHours(20, 0, 0, 0); // 8:00 PM - after evening medication

        await prisma.task.create({
          data: {
            petId,
            taskType: 'feeding',
            title: `Feed ${petName} half meal with food`,
            description: value,
            scheduledDate: feedingTime,
            scheduledTime: '20:00',
            recurring: false,
            completed: false,
          },
        });
        created++;
        hasFeedingTask = true;
        console.log('✅ Created feeding task for first night (8:00 PM)');
        break;
      }
    }

    // Create water task (first night: small amounts)
    const waterFields = ['Procedures', 'procedures', 'Water', 'water', 'Water Instructions', 'waterInstructions', 'Hydration', 'hydration'];
    for (const field of waterFields) {
      const value = answers[field] || answers[field.toLowerCase()];
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`✅ [DischargeTasks] Found water field "${field}"`);
        const waterTime = new Date(dischargeDate);
        waterTime.setUTCHours(20, 30, 0, 0); // 8:30 PM - after feeding

        await prisma.task.create({
          data: {
            petId,
            taskType: 'care',
            title: `Offer ${petName} small amounts of water`,
            description: value,
            scheduledDate: waterTime,
            scheduledTime: '20:30',
            recurring: false,
            completed: false,
          },
        });
        created++;
        console.log('✅ Created water task for first night (8:30 PM)');
        break; // Only create one water task
      }
    }

    // Create activity restriction task
    const activityFields = ['Activity/Restrictions', 'activity/restrictions', 'Activity', 'activity', 'Restrictions', 'restrictions', 'Exercise', 'exercise', 'Walking', 'walking'];
    for (const field of activityFields) {
      const value = answers[field] || answers[field.toLowerCase()];
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`✅ [DischargeTasks] Found activity field "${field}"`);
        // Extract duration (e.g., "3-5 days", "2 weeks")
        const daysMatch = value.match(/(\d+)[\s-]+(\d+)?\s*days?/i);
        const weeksMatch = value.match(/(\d+)\s*weeks?/i);
        let durationDays = 5; // Default
        if (daysMatch) {
          const maxDays = daysMatch[2];
          const minDays = daysMatch[1];
          durationDays = parseInt((maxDays || minDays || '5'), 10);
        } else if (weeksMatch && weeksMatch[1]) {
          durationDays = parseInt(weeksMatch[1], 10) * 7;
        }

        const activityTime = new Date(dischargeDate);
        activityTime.setUTCHours(12, 0, 0, 0); // Noon reminder

        await prisma.task.create({
          data: {
            petId,
            taskType: 'care',
            title: `Leash-walk ${petName} only (restricted activity)`,
            description: value,
            scheduledDate: activityTime,
            scheduledTime: '12:00',
            recurring: true,
            recurrencePattern: 'daily',
            recurrenceEndDate: new Date(dischargeDate.getTime() + durationDays * 24 * 60 * 60 * 1000),
            completed: false,
          },
        });
        created++;
        console.log(`✅ Created activity restriction task (${durationDays} days)`);
        break; // Only create one activity task
      }
    }

    // Create other instruction tasks (dental care, e-collar, etc.)
    const otherFields = ['Other instructions', 'other instructions', 'Other Instructions', 'Additional Instructions', 'additionalInstructions', 'Special Instructions', 'specialInstructions', 'Notes', 'notes'];
    let otherInstructionsValue: string | null = null;
    
    // Find the first matching field (avoid duplicates)
    for (const field of otherFields) {
      const value = answers[field] || answers[field.toLowerCase()];
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`✅ [DischargeTasks] Found other instructions field "${field}"`);
        otherInstructionsValue = value;
        break; // Stop after finding first match
      }
    }
    
    if (otherInstructionsValue) {
      const value = otherInstructionsValue;
      // Check for dental care (typically 2 weeks later)
      if (value.toLowerCase().includes('dental') || value.toLowerCase().includes('brushing')) {
          const dentalDate = new Date(dischargeDate);
          dentalDate.setUTCDate(dentalDate.getUTCDate() + 14); // 2 weeks later
          dentalDate.setUTCHours(9, 0, 0, 0);

          await prisma.task.create({
            data: {
              petId,
              taskType: 'care',
              title: `Start brushing ${petName}'s teeth or dental treats`,
              description: value,
              scheduledDate: dentalDate,
              scheduledTime: '09:00',
              recurring: false,
              completed: false,
            },
          });
          created++;
          console.log('✅ Created dental care task (2 weeks later)');
        }

        // Check for e-collar instruction
        if (value.toLowerCase().includes('e-collar') || value.toLowerCase().includes('collar')) {
          const collarTime = new Date(dischargeDate);
          collarTime.setUTCHours(21, 0, 0, 0); // 9:00 PM - evening reminder

          await prisma.task.create({
            data: {
              petId,
              taskType: 'care',
              title: `Check if ${petName} needs e-collar`,
              description: value,
              scheduledDate: collarTime,
              scheduledTime: '21:00',
              recurring: false,
              completed: false,
            },
          });
          created++;
        console.log('✅ Created e-collar reminder task (9:00 PM)');
      }
    }

    if (created === 0) {
      console.warn('⚠️ [DischargeTasks] No tasks were created. Check field names in Tally form.');
      console.warn('⚠️ [DischargeTasks] Answer keys available:', Object.keys(answers || {}));
    } else {
      console.log(`✅ [DischargeTasks] Created ${created} task(s) from discharge form for ${petName}`);
    }
  } catch (error: any) {
    const errorMsg = `Failed to create tasks from discharge: ${error.message}`;
    errors.push(errorMsg);
    console.error(`❌ [DischargeTasks] ${errorMsg}`, error);
    console.error(`❌ [DischargeTasks] Stack:`, error.stack);
  }

  return { created, errors };
}
