/**
 * Export Debugging Utility
 * Use this in browser console to test and debug PDF export functionality
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Utility to test graph capture
export const testGraphCapture = async () => {
  console.log('%c📊 GRAPH CAPTURE TEST', 'color: #0284C7; font-size: 14px; font-weight: bold;');

  try {
    const graphs = document.querySelectorAll('.graph-viewer');
    console.log(`Found ${graphs.length} graph(s)`);

    if (graphs.length === 0) {
      console.warn('⚠️ No graphs found on page. Go to Data Monitoring or History to test.');
      return;
    }

    for (let i = 0; i < graphs.length; i++) {
      const graph = graphs[i];
      const title = graph.querySelector('h3, h2, h4')?.textContent || `Graph ${i + 1}`;

      console.group(`\n📈 Graph ${i + 1}: ${title}`);
      console.log(`Width: ${graph.offsetWidth}px, Height: ${graph.offsetHeight}px`);

      try {
        const canvas = await html2canvas(graph, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          timeout: 10000
        });

        console.log(`✓ Capture successful`);
        console.log(`Canvas size: ${canvas.width}x${canvas.height}px`);
        console.log(`PNG data URI length: ${canvas.toDataURL('image/png').length} bytes`);

        // Show preview
        console.log('Image preview:');
        console.image(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error(`✗ Capture failed:`, error.message);
      }

      console.groupEnd();
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Utility to test PDF creation
export const testPDFCreation = async () => {
  console.log('%c📄 PDF CREATION TEST', 'color: #10B981; font-size: 14px; font-weight: bold;');

  try {
    const graph = document.querySelector('.graph-viewer');
    if (!graph) {
      console.warn('⚠️ No graph found. Go to Data Monitoring or History first.');
      return;
    }

    console.log('Capturing graph...');
    const canvas = await html2canvas(graph, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const image = canvas.toDataURL('image/png');
    console.log(`✓ Graph captured: ${(image.length / 1024).toFixed(2)}KB`);

    console.log('Creating PDF...');
    const pdf = new jsPDF('landscape', 'mm', 'a4');

    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    console.log(`Image dimensions: ${imgWidth}mm x ${imgHeight}mm`);
    console.log(`Page height: ${pageHeight}mm`);

    if (imgHeight > pageHeight - 40) {
      console.warn(`⚠️ Image exceeds page height, scaling down...`);
      const scaledHeight = pageHeight - 40;
      pdf.addImage(image, 'PNG', 10, 10, imgWidth, scaledHeight);
    } else {
      pdf.addImage(image, 'PNG', 10, 10, imgWidth, imgHeight);
    }

    pdf.setFontSize(10);
    pdf.text('Test PDF - Equipment Monitoring Graph', 10, imgHeight + 20);
    pdf.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 10, imgHeight + 25);

    // Save without downloading (just testing)
    const testFilename = `test-export-${Date.now()}.pdf`;
    pdf.save(testFilename);
    console.log(`✓ PDF created and saved as: ${testFilename}`);
  } catch (error) {
    console.error('✗ PDF creation failed:', error);
  }
};

// Utility to check export readiness
export const checkExportReadiness = () => {
  console.log('%c🔍 EXPORT READINESS CHECK', 'color: #F59E0B; font-size: 14px; font-weight: bold;');

  const checks = {
    'html2canvas': typeof html2canvas !== 'undefined',
    'jsPDF': typeof jsPDF !== 'undefined',
    'ResponsiveContainers': document.querySelectorAll('[class*="ResponsiveContainer"]').length > 0,
    'GraphViewers': document.querySelectorAll('.graph-viewer').length > 0,
    'Export Buttons': document.querySelectorAll('button[aria-label*="Export"], button:contains("Export")').length > 0,
  };

  for (const [check, status] of Object.entries(checks)) {
    console.log(`${status ? '✓' : '✗'} ${check}: ${status}`);
  }

  console.log('\n📋 Recommendations:');
  if (!checks['GraphViewers']) {
    console.log('• Navigate to Data Monitoring or History to display graphs');
  }
  if (checks['GraphViewers']) {
    console.log('• Run testGraphCapture() to test graph capture');
    console.log('• Run testPDFCreation() to test PDF generation');
  }
};

// Global console utilities
if (typeof window !== 'undefined') {
  window.exportDebug = {
    testGraphCapture,
    testPDFCreation,
    checkExportReadiness,
    help: () => {
      console.log('%cAvailable Debug Functions:', 'color: #0284C7; font-weight: bold;');
      console.log('exportDebug.checkExportReadiness() - Check if export system is ready');
      console.log('exportDebug.testGraphCapture() - Test capturing graphs as images');
      console.log('exportDebug.testPDFCreation() - Test PDF generation');
    }
  };

  console.log('%c🚀 Export Debug Utility Loaded', 'color: #10B981; font-weight: bold;');
  console.log('Type: exportDebug.help() to see available functions');
}
