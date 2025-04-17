import { jsPDF } from 'jspdf';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NodeletExecuteContext } from '../type';

enum FileType {
    txt = 'txt',
    pdf = 'pdf',
    md = 'md',
    json = 'json',
}

export async function saveToCustomFile({ nodeInputs, nodeConfig }: NodeletExecuteContext) {
    try {
        const { content } = nodeInputs as { content: string };
        const { fileType, fileName, folderPath } = nodeConfig;
        
        // Ensure directory exists
        await fs.mkdir(folderPath, { recursive: true });
        
        const fullPath = path.join(folderPath, `${fileName}.${fileType}`);
        
        switch (fileType) {
            case FileType.txt:
            case FileType.md: {
                await fs.writeFile(fullPath, content, 'utf-8');
                console.log(`File successfully saved to ${fullPath}`);
                break;
            }
            case FileType.json: {
                const jsonContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
                await fs.writeFile(fullPath, jsonContent, 'utf-8');
                console.log(`JSON file successfully saved to ${fullPath}`);
                break;
            }
            case FileType.pdf: {
                const doc = new jsPDF();
                doc.text(content, 10, 10);
                // Using a buffer to save the PDF
                const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
                await fs.writeFile(fullPath, pdfBuffer);
                console.log(`PDF file successfully saved to ${fullPath}`);
                break;
            }
            default:
                throw new Error(`Unsupported file type: ${fileType}`);
        }
        
        return { success: true, path: fullPath };
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
}
