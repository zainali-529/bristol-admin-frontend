import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Loader2, Table, FileSpreadsheet, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

function DocumentCreatorSheet({ open, onOpenChange, onSave, loading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('reports');
  const [tags, setTags] = useState('');
  const [columns, setColumns] = useState(['Column 1', 'Column 2', 'Column 3']);
  const [rows, setRows] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);
  const [importedFileName, setImportedFileName] = useState(null);

  useEffect(() => {
    if (!open) {
      // Reset form when sheet closes
      setTitle('');
      setDescription('');
      setCategory('reports');
      setTags('');
      setColumns(['Column 1', 'Column 2', 'Column 3']);
      setRows([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]);
      setImportedFileName(null);
    }
  }, [open]);

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Check if file is supported
    const supportedFormats = ['xlsx', 'xls', 'csv'];
    if (!supportedFormats.includes(fileExtension)) {
      toast.error('Please import an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        let workbook;
        
        if (fileExtension === 'csv') {
          // Parse CSV
          const csvText = data;
          const lines = csvText.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            toast.error('CSV file is empty');
            return;
          }
          
          // First line is headers
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const dataRows = lines.slice(1).map(line => 
            line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
          );
          
          setColumns(headers.length > 0 ? headers : ['Column 1']);
          setRows(dataRows.length > 0 ? dataRows : [Array(headers.length || 1).fill('')]);
          setImportedFileName(file.name);
          toast.success('File imported successfully');
        } else {
          // Parse Excel
          workbook = XLSX.read(data, { type: 'binary' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON array
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length === 0) {
            toast.error('Excel file is empty');
            return;
          }
          
          // First row is headers
          const headers = jsonData[0] || [];
          const dataRows = jsonData.slice(1);
          
          // Ensure headers are strings
          const headerStrings = headers.map(h => String(h || `Column ${headers.indexOf(h) + 1}`));
          
          // Ensure all rows have same length as headers
          const normalizedRows = dataRows.map(row => {
            const rowArray = Array.isArray(row) ? row : [row];
            return headerStrings.map((_, i) => String(rowArray[i] || ''));
          });
          
          setColumns(headerStrings.length > 0 ? headerStrings : ['Column 1']);
          setRows(normalizedRows.length > 0 ? normalizedRows : [Array(headerStrings.length || 1).fill('')]);
          setImportedFileName(file.name);
          
          // Set title from filename if not set
          if (!title) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setTitle(nameWithoutExt);
          }
          
          toast.success('Excel file imported successfully');
        }
      } catch (error) {
        console.error('Error importing file:', error);
        toast.error('Failed to import file. Please check the file format.');
      }
    };
    
    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleAddColumn = () => {
    const newColumnName = `Column ${columns.length + 1}`;
    setColumns([...columns, newColumnName]);
    setRows(rows.map(row => [...row, '']));
  };

  const handleRemoveColumn = (index) => {
    if (columns.length <= 1) {
      toast.error('You must have at least one column');
      return;
    }
    setColumns(columns.filter((_, i) => i !== index));
    setRows(rows.map(row => row.filter((_, i) => i !== index)));
  };

  const handleColumnNameChange = (index, value) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    setColumns(newColumns);
  };

  const handleAddRow = () => {
    setRows([...rows, Array(columns.length).fill('')]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length <= 1) {
      toast.error('You must have at least one row');
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const generateExcelFile = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet data with headers
      const wsData = [columns, ...rows];
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      
      // Generate buffer with explicit settings
      const wbout = XLSX.write(wb, { 
        bookType: 'xlsx', 
        type: 'array',
        bookSST: false
      });
      
      // Create blob with proper MIME type
      const blob = new Blob([wbout], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      console.log('Generated Excel blob:', {
        size: blob.size,
        type: blob.type
      });
      
      return blob;
    } catch (error) {
      console.error('Error generating Excel file:', error);
      throw error;
    }
  };

  const handleDownloadPreview = () => {
    try {
      const blob = generateExcelFile();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}_preview.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Preview downloaded successfully');
    } catch (error) {
      toast.error('Failed to download preview');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    // Check if there's any data
    const hasData = rows.some(row => row.some(cell => cell.trim() !== ''));
    if (!hasData) {
      toast.error('Please add some data to your document');
      return;
    }

    try {
      // Generate Excel file
      const blob = generateExcelFile();
      
      // Ensure blob has correct type
      const typedBlob = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const file = new File([typedBlob], `${title}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        lastModified: Date.now()
      });

      console.log('=== File Creation Details ===');
      console.log('File name:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      console.log('Blob type:', typedBlob.type);
      console.log('Last modified:', file.lastModified);
      console.log('============================');

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('category', category);
      formData.append('tags', tags || 'created-document, spreadsheet');
      formData.append('accessLevel', 'private');
      formData.append('isPublic', 'false');
      formData.append('isActive', 'true');
      formData.append('isArchived', 'false');

      // Call parent save function
      await onSave(formData);
      
      // Close sheet
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Create Spreadsheet Document
            </div>
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Create a spreadsheet document with custom headers and data. The document will be saved as an Excel file.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Document Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>Document Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Monthly Sales Report, Customer List"
                maxLength={200}
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" style={{ color: 'var(--text-primary)' }}>Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document"
                rows={2}
                maxLength={1000}
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" style={{ color: 'var(--text-primary)' }}>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="category"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="invoices">Invoices</SelectItem>
                    <SelectItem value="quotes">Quotes</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" style={{ color: 'var(--text-primary)' }}>Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., sales, 2024, monthly"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <Separator />

            {/* Import Section */}
            <div className="space-y-2">
              <Label style={{ color: 'var(--text-primary)' }}>Import Existing File</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center" style={{ borderColor: 'var(--border)' }}>
                <FileUp className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                <Label htmlFor="import-file-sheet" className="cursor-pointer">
                  <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Click to import</span>
                  <span className="text-xs block mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Excel (.xlsx, .xls) or CSV (.csv)
                  </span>
                </Label>
                <Input
                  id="import-file-sheet"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportFile}
                  className="hidden"
                />
                {importedFileName && (
                  <Badge variant="secondary" className="mt-2">
                    Imported: {importedFileName}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Spreadsheet Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label style={{ color: 'var(--text-primary)' }}>
                <Table className="h-4 w-4 inline mr-2" />
                Spreadsheet Data
              </Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleDownloadPreview}>
                  <Download className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleAddColumn}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleAddRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-auto" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <th className="w-12 p-2 text-center" style={{ color: 'var(--text-secondary)' }}>#</th>
                    {columns.map((col, colIndex) => (
                      <th key={colIndex} className="p-2 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <Input
                            value={col}
                            onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                            className="font-semibold"
                            placeholder={`Column ${colIndex + 1}`}
                            style={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveColumn(colIndex)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center justify-center gap-1">
                          <span>{rowIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRow(rowIndex)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="p-2">
                          <Input
                            value={cell}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            placeholder="Enter value"
                            style={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Badge variant="secondary">{columns.length} Columns</Badge>
              <Badge variant="secondary">{rows.length} Rows</Badge>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4 p-4 border-t">
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Save Document
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default DocumentCreatorSheet;

