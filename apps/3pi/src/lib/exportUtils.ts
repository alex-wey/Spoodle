import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface ReportData {
  totalPets: number;
  compliantPets: number;
  nonCompliantPets: number;
  recentCheckIns: number;
  monthlyTrends: {
    month: string;
    checkIns: number;
    complianceChecks: number;
  }[];
  topPetTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  complianceByCategory: {
    category: string;
    compliant: number;
    nonCompliant: number;
    total: number;
  }[];
}

interface ExportOptions {
  dateRange: string;
  reportType: string;
  organizationName?: string;
}

export const exportToPDF = async (data: ReportData, options: ExportOptions) => {
  const doc = new jsPDF()
  
  // Set document properties
  doc.setProperties({
    title: `Spoodle 3PI Report - ${options.dateRange}`,
    subject: `${options.reportType} Report`,
    author: options.organizationName || 'Spoodle 3PI',
    creator: 'Spoodle 3PI System'
  })

  // Add header
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246) // Primary blue
  doc.text('Spoodle 3PI Report', 20, 20)
  
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)
  doc.text(`Date Range: ${options.dateRange}`, 20, 37)
  doc.text(`Report Type: ${options.reportType}`, 20, 44)

  // Key Metrics Section
  doc.setFontSize(16)
  doc.setTextColor(30, 30, 30)
  doc.text('Key Metrics', 20, 60)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  
  const metrics = [
    ['Total Pets', data.totalPets.toLocaleString()],
    ['Compliant Pets', data.compliantPets.toLocaleString()],
    ['Non-Compliant Pets', data.nonCompliantPets.toLocaleString()],
    ['Recent Check-ins', data.recentCheckIns.toLocaleString()],
    ['Compliance Rate', `${Math.round((data.compliantPets / data.totalPets) * 100)}%`]
  ]
  
  doc.autoTable({
    startY: 65,
    head: [['Metric', 'Value']],
    body: metrics,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  })

  // Pet Types Distribution
  doc.setFontSize(16)
  doc.setTextColor(30, 30, 30)
  doc.text('Pet Types Distribution', 20, doc.lastAutoTable.finalY + 20)
  
  const petTypesData = data.topPetTypes.map(pt => [
    pt.type,
    pt.count.toLocaleString(),
    `${pt.percentage}%`
  ])
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Pet Type', 'Count', 'Percentage']],
    body: petTypesData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  })

  // Compliance by Category
  doc.setFontSize(16)
  doc.setTextColor(30, 30, 30)
  doc.text('Compliance by Category', 20, doc.lastAutoTable.finalY + 20)
  
  const complianceData = data.complianceByCategory.map(cat => {
    const rate = Math.round((cat.compliant / cat.total) * 100)
    return [
      cat.category,
      cat.compliant.toLocaleString(),
      cat.nonCompliant.toLocaleString(),
      cat.total.toLocaleString(),
      `${rate}%`
    ]
  })
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Category', 'Compliant', 'Non-Compliant', 'Total', 'Rate']],
    body: complianceData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  })

  // Monthly Trends
  doc.setFontSize(16)
  doc.setTextColor(30, 30, 30)
  doc.text('Monthly Activity Trends', 20, doc.lastAutoTable.finalY + 20)
  
  const trendsData = data.monthlyTrends.map(trend => [
    trend.month,
    trend.checkIns.toString(),
    trend.complianceChecks.toString()
  ])
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Month', 'Check-ins', 'Compliance Checks']],
    body: trendsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount} | Spoodle 3PI Report | ${new Date().toLocaleDateString()}`,
      20,
      doc.internal.pageSize.height - 10
    )
  }

  // Save the PDF
  const filename = `spoodle-report-${options.dateRange}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
  
  return filename
}

export const exportToCSV = (data: ReportData, options: ExportOptions) => {
  // Helper function to convert data to CSV format
  const arrayToCSV = (arr: any[]): string => {
    if (arr.length === 0) return ''
    
    const headers = Object.keys(arr[0])
    const csvRows = [
      headers.join(','),
      ...arr.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  }

  // Create CSV content
  const csvContent = [
    // Header
    `Spoodle 3PI Report - ${options.dateRange}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    `Report Type: ${options.reportType}`,
    '',
    
    // Key Metrics
    'Key Metrics',
    'Metric,Value',
    `Total Pets,${data.totalPets}`,
    `Compliant Pets,${data.compliantPets}`,
    `Non-Compliant Pets,${data.nonCompliantPets}`,
    `Recent Check-ins,${data.recentCheckIns}`,
    `Compliance Rate,${Math.round((data.compliantPets / data.totalPets) * 100)}%`,
    '',
    
    // Pet Types Distribution
    'Pet Types Distribution',
    'Type,Count,Percentage',
    ...data.topPetTypes.map(pt => `${pt.type},${pt.count},${pt.percentage}%`),
    '',
    
    // Compliance by Category
    'Compliance by Category',
    'Category,Compliant,Non-Compliant,Total,Rate',
    ...data.complianceByCategory.map(cat => {
      const rate = Math.round((cat.compliant / cat.total) * 100)
      return `${cat.category},${cat.compliant},${cat.nonCompliant},${cat.total},${rate}%`
    }),
    '',
    
    // Monthly Trends
    'Monthly Activity Trends',
    'Month,Check-ins,Compliance Checks',
    ...data.monthlyTrends.map(trend => `${trend.month},${trend.checkIns},${trend.complianceChecks}`)
  ].join('\n')

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `spoodle-report-${options.dateRange}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const filename = `spoodle-report-${options.dateRange}-${new Date().toISOString().split('T')[0]}.csv`
  return filename
}

// Helper function to format date range for display
export const formatDateRange = (range: string): string => {
  const now = new Date()
  const ranges = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days', 
    '90d': 'Last 90 Days',
    '1y': 'Last Year'
  }
  return ranges[range as keyof typeof ranges] || range
}

// Helper function to get date range dates
export const getDateRangeDates = (range: string): { start: Date; end: Date } => {
  const end = new Date()
  const start = new Date()
  
  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    case '1y':
      start.setFullYear(end.getFullYear() - 1)
      break
    default:
      start.setDate(end.getDate() - 30)
  }
  
  return { start, end }
}
