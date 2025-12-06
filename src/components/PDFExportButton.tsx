import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

interface PDFExportButtonProps {
    title: string;
    data: any[];
    columns: { header: string; dataKey: string }[];
    fileName?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
    title,
    data,
    columns,
    fileName = 'relatorio.pdf'
}) => {
    const handleExport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

        // Table
        autoTable(doc, {
            head: [columns.map(col => col.header)],
            body: data.map(row => columns.map(col => row[col.dataKey])),
            startY: 40,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(
                `Página ${i} de ${pageCount} - VOB Mandakaru`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        doc.save(fileName);
    };

    return (
        <button
            onClick={handleExport}
            className="btn-secondary-premium flex items-center gap-2"
            title="Exportar para PDF"
        >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar PDF</span>
        </button>
    );
};
