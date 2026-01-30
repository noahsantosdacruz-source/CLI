import fs from 'fs';
import PDFDocument from 'pdfkit';

const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('output.pdf'));

doc.fontSize(20).text('Informations du projet', { underline: true });
doc.moveDown();

Object.entries(data).forEach(([key, value]) => {
  doc.fontSize(12).text(`${key} : ${value}`);
});

doc.end();
console.log('PDF généré avec succès : output.pdf');