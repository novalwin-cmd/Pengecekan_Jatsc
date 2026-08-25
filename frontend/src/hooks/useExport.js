/**
 * useExport Hook - Export data in multiple formats
 * Supports CSV, XLSX, PDF
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useExport = () => {
  /**
   * Export Daily Check as CSV
   */
  const exportCSV = (check) => {
    const csvData = [];

    // Header
    csvData.push(['JATSC Daily Check Export']);
    csvData.push([]);
    csvData.push(['Check ID', `#${check.id}`]);
    csvData.push(['Date', new Date(check.date).toLocaleDateString('id-ID')]);
    csvData.push(['Shift', check.shift]);
    csvData.push(['Start Time', check.start_time]);
    csvData.push(['Stop Time', check.stop_time || 'N/A']);
    csvData.push(['Status', check.status]);
    csvData.push([]);

    // Personnel
    csvData.push(['PERSONNEL']);
    check.personnel.forEach(p => {
      csvData.push([p.name, p.role]);
    });
    csvData.push([]);

    // Readings
    csvData.push(['EQUIPMENT READINGS']);
    csvData.push(['Equipment', 'Location', 'Peralatan', 'R (V)', 'S (V)', 'T (V)', 'Temp In', 'Temp Out', 'Keterangan', 'Anomaly']);

    check.readings.forEach(r => {
      csvData.push([
        r.equipment_type.toUpperCase(),
        r.location,
        r.peralatan,
        r.R || '',
        r.S || '',
        r.T || '',
        r.in_temp || '',
        r.out_temp || '',
        r.keterangan || '',
        r.anomaly_detected ? 'YES' : 'NO'
      ]);
    });

    if (check.notes) {
      csvData.push([]);
      csvData.push(['NOTES', check.notes]);
    }

    const csv = Papa.unparse(csvData);
    downloadFile(csv, `daily-check-${check.id}.csv`, 'text/csv');
  };

  /**
   * Export Daily Check as XLSX (Excel)
   */
  const exportXLSX = (check) => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['JATSC Daily Check'],
      [],
      ['Check ID', `#${check.id}`],
      ['Date', new Date(check.date).toLocaleDateString('id-ID')],
      ['Shift', check.shift],
      ['Start Time', check.start_time],
      ['Stop Time', check.stop_time || 'N/A'],
      ['Status', check.status],
      [],
      [`Total Personnel: ${check.personnel.length}`],
      [`Total Readings: ${check.readings.length}`],
      [`Chiller: ${check.readings.filter(r => r.equipment_type === 'chiller').length}`],
      [`Pump: ${check.readings.filter(r => r.equipment_type === 'pump').length}`],
      [`AHU: ${check.readings.filter(r => r.equipment_type === 'ahu').length}`],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Personnel Sheet
    const personnelData = [
      ['Name', 'Role', 'Sequence']
    ];
    check.personnel.forEach(p => {
      personnelData.push([p.name, p.role, p.sequence]);
    });
    const personnelSheet = XLSX.utils.aoa_to_sheet(personnelData);
    XLSX.utils.book_append_sheet(wb, personnelSheet, 'Personnel');

    // Readings Sheet
    const readingsData = [
      ['Equipment', 'Location', 'Peralatan', 'R (V)', 'S (V)', 'T (V)', 'Temp In', 'Temp Out', 'Keterangan', 'Anomaly']
    ];
    check.readings.forEach(r => {
      readingsData.push([
        r.equipment_type.toUpperCase(),
        r.location,
        r.peralatan,
        r.R || '',
        r.S || '',
        r.T || '',
        r.in_temp || '',
        r.out_temp || '',
        r.keterangan || '',
        r.anomaly_detected ? 'YES' : 'NO'
      ]);
    });
    const readingsSheet = XLSX.utils.aoa_to_sheet(readingsData);
    XLSX.utils.book_append_sheet(wb, readingsSheet, 'Readings');

    // Write file
    XLSX.writeFile(wb, `daily-check-${check.id}.xlsx`);
  };

  /**
   * Export Daily Check as PDF
   */
  const exportPDF = (check) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('JATSC Daily Check Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Header Info
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const headerData = [
      [`Check ID: #${check.id}`, `Date: ${new Date(check.date).toLocaleDateString('id-ID')}`],
      [`Shift: ${check.shift}`, `Start Time: ${check.start_time}`],
      [`Status: ${check.status}`, `Stop Time: ${check.stop_time || 'N/A'}`],
    ];

    headerData.forEach(row => {
      doc.text(row[0], 20, yPosition);
      doc.text(row[1], pageWidth / 2, yPosition);
      yPosition += 7;
    });
    yPosition += 5;

    // Personnel Section
    doc.setFont(undefined, 'bold');
    doc.text('Personnel Involved:', 20, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');

    if (check.personnel.length > 0) {
      check.personnel.forEach(p => {
        doc.text(`• ${p.name} (${p.role})`, 25, yPosition);
        yPosition += 5;
      });
    } else {
      doc.text('No personnel recorded', 25, yPosition);
      yPosition += 5;
    }
    yPosition += 5;

    // Readings Table
    doc.setFont(undefined, 'bold');
    doc.text('Equipment Readings:', 20, yPosition);
    yPosition += 5;

    const readingsTableData = [
      ['Equipment', 'Location', 'Peralatan', 'R', 'S', 'T', 'Temp In', 'Anomaly']
    ];
    check.readings.forEach(r => {
      readingsTableData.push([
        r.equipment_type.toUpperCase(),
        r.location.substring(0, 15),
        r.peralatan.substring(0, 15),
        r.R ? r.R.toString() : '',
        r.S ? r.S.toString() : '',
        r.T ? r.T.toString() : '',
        r.in_temp ? r.in_temp.toString() : '',
        r.anomaly_detected ? 'YES' : 'NO'
      ]);
    });

    doc.autoTable({
      head: [readingsTableData[0]],
      body: readingsTableData.slice(1),
      startY: yPosition,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Notes (if any)
    if (check.notes) {
      yPosition = doc.lastAutoTable.finalY + 10;
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 20, yPosition);
      yPosition += 5;
      doc.setFont(undefined, 'normal');
      const wrappedText = doc.splitTextToSize(check.notes, pageWidth - 40);
      doc.text(wrappedText, 20, yPosition);
    }

    // Footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleString('id-ID')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    doc.save(`daily-check-${check.id}.pdf`);
  };

  /**
   * Helper to download file
   */
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    exportCSV,
    exportXLSX,
    exportPDF,
  };
};
