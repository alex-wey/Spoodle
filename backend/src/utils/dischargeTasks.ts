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
 * Extract structured medication data from form fields (new structured form format)
 */
function extractStructuredMedication(answers: any): ParsedMedication | null {
  // Check for structured medication fields
  const name = answers['Name'] || answers['name'] || answers['Medication Name'] || answers['medication_name'];
  const strength = answers['Strength/Dosage'] || answers['strength/dosage'] || answers['strength'] || answers['dosage'];
  const quantityStr = answers['Total quantity dispensed'] || answers['total quantity dispensed'] || answers['quantity'];
  const doseAmountStr = answers['Dose amount'] || answers['dose amount'] || answers['dose'];
  const doseUnit = answers['Dose unit'] || answers['dose unit'] || answers['unit'];
  const frequencyStr = answers['Frequency'] || answers['frequency'];
  const instructions = answers['Other instructions'] || answers['other instructions'] || answers['Special Instructions'] || '';

  // If any required fields are missing, return null
  if (!name || !quantityStr || !doseAmountStr || !frequencyStr) {
    console.log('   ⚠️ Missing required structured medication fields');
    return null;
  }

  console.log(`   ✅ Found structured medication data:`, { name, strength, quantityStr, doseAmountStr, doseUnit, frequencyStr });

  // Parse total quantity
  const totalQuantity = parseInt(String(quantityStr), 10);
  if (isNaN(totalQuantity) || totalQuantity <= 0) {
    console.log(`   ⚠️ Invalid total quantity: ${quantityStr}`);
    return null;
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

  // Map frequency dropdown value to internal frequency code
  let frequency: ParsedMedication['frequency'] = 'twice_daily'; // default
  const freqLower = String(frequencyStr).toLowerCase();
  
  if (freqLower.includes('once') || freqLower.includes('sid') || freqLower.includes('qd') || freqLower.includes('daily') && !freqLower.includes('twice') && !freqLower.includes('three')) {
    frequency = 'once_daily';
  } else if (freqLower.includes('twice') || freqLower.includes('bid') || freqLower.includes('q12h') || freqLower.includes('q12')) {
    frequency = 'twice_daily';
  } else if (freqLower.includes('three') || freqLower.includes('tid') || freqLower.includes('q8h') || freqLower.includes('q8')) {
    frequency = 'three_times_daily';
  } else if (freqLower.includes('four') || freqLower.includes('qid') || freqLower.includes('q6h') || freqLower.includes('q6')) {
    frequency = 'every_8_hours'; // Using every_8_hours as closest match for QID
  } else if (freqLower.includes('as needed') || freqLower.includes('prn')) {
    frequency = 'as_needed';
  }

  console.log(`   📊 Parsed structured med: ${name} - ${totalQuantity} total, ${dosePerAdmin} per dose, ${frequency}`);

  return {
    name,
    dosage: strength || '',
    totalQuantity,
    dosePerAdmin,
    doseUnit: doseUnit || 'tablet(s)',
    frequency,
    instructions: instructions || `${name} ${strength || ''} - Give ${doseAmountStr} ${doseUnit || 'tablet(s)'} ${frequencyStr}`,
  };
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

    // First, try to extract structured medication data (new form format)
    const medications: ParsedMedication[] = [];
    
    console.log('🔍 [DischargeTasks] Attempting to extract structured medication data...');
    const structuredMed = extractStructuredMedication(answers);
    if (structuredMed) {
      console.log('✅ [DischargeTasks] Found structured medication data');
      medications.push(structuredMed);
    } else {
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
    for (const med of medications) {
      try {
        const { totalDoses, durationDays } = calculateMedicationSchedule(med);
        if (totalDoses === 0) continue;

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
        const timeParts = firstEveningTime.split(':');
        const hours = parseInt(timeParts[0] || '19', 10);
        const minutes = parseInt(timeParts[1] || '0', 10);
        feedingTime.setUTCHours(hours, minutes, 0, 0);

        await prisma.task.create({
          data: {
            petId,
            taskType: 'feeding',
            title: `Feed ${petName} half meal with food`,
            description: value,
            scheduledDate: feedingTime,
            scheduledTime: firstEveningTime,
            recurring: false,
            completed: false,
          },
        });
        created++;
        hasFeedingTask = true;
        console.log('✅ Created feeding task for first night');
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
        const timeParts = firstEveningTime.split(':');
        const hours = parseInt(timeParts[0] || '19', 10);
        const minutes = parseInt(timeParts[1] || '0', 10);
        waterTime.setUTCHours(hours, minutes, 0, 0);

        await prisma.task.create({
          data: {
            petId,
            taskType: 'care',
            title: `Offer ${petName} small amounts of water`,
            description: value,
            scheduledDate: waterTime,
            scheduledTime: firstEveningTime,
            recurring: false,
            completed: false,
          },
        });
        created++;
        console.log('✅ Created water task for first night');
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
          const timeParts = firstEveningTime.split(':');
          const hours = parseInt(timeParts[0] || '19', 10);
          const minutes = parseInt(timeParts[1] || '0', 10);
          collarTime.setUTCHours(hours, minutes, 0, 0);

          await prisma.task.create({
            data: {
              petId,
              taskType: 'care',
              title: `Check if ${petName} needs e-collar`,
              description: value,
              scheduledDate: collarTime,
              scheduledTime: firstEveningTime,
              recurring: false,
              completed: false,
            },
          });
          created++;
        console.log('✅ Created e-collar reminder task');
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
