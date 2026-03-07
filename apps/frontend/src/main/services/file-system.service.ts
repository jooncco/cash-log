import { dialog } from 'electron';
import { writeFile } from 'fs/promises';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';

export class FileSystemService {
  async saveFile(data: any[], format: 'csv' | 'excel' | 'pdf'): Promise<string | null> {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `transactions.${format}`,
      filters: [
        { name: format.toUpperCase(), extensions: [format] },
      ],
    });

    if (!filePath) return null;

    switch (format) {
      case 'csv':
        await this.exportToCSV(filePath, data);
        break;
      case 'excel':
        await this.exportToExcel(filePath, data);
        break;
      case 'pdf':
        await this.exportToPDF(filePath, data);
        break;
    }

    return filePath;
  }

  async openFile(): Promise<string[] | null> {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'CSV', extensions: ['csv'] },
      ],
    });

    return filePaths.length > 0 ? filePaths : null;
  }

  private async exportToCSV(filePath: string, data: any[]) {
    const csv = Papa.unparse(data);
    await writeFile(filePath, csv, 'utf-8');
  }

  private async exportToExcel(filePath: string, data: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key,
        key,
        width: 15,
      }));
      worksheet.addRows(data);
    }

    await workbook.xlsx.writeFile(filePath);
  }

  private async exportToPDF(filePath: string, data: any[]) {
    return new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = createWriteStream(filePath);

      stream.on('finish', resolve);
      stream.on('error', reject);

      doc.pipe(stream);
      doc.fontSize(16).text('Transactions', { align: 'center' });
      doc.moveDown();

      data.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${JSON.stringify(item)}`);
      });

      doc.end();
    });
  }
}
