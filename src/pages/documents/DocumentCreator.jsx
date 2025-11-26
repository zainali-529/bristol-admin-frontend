import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { createDocument, fetchDocuments, fetchDocumentStats } from '@/store/documentsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Loader2, Table, FileSpreadsheet, Upload, ArrowLeft, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

function DocumentCreator() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
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
  const [loading, setLoading] = useState(false);
  const [importedFileName, setImportedFileName] = useState(null);

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

    setLoading(true);
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

      // Save document
      await dispatch(createDocument(formData)).unwrap();
      toast.success('Document created successfully');
      
      // Refresh documents list
      dispatch(fetchDocumentStats());
      dispatch(fetchDocuments({ page: 1, limit: 10 }));
      
      // Navigate back to documents page
      navigate('/documents');
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error(error?.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="h-8 w-8" />
              Create Spreadsheet Document
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a new spreadsheet document or import an existing Excel/CSV file
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Document Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
              <CardDescription>
                Basic information about your document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Monthly Sales Report"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reports">Reports</SelectItem>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="quotes">Quotes</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., sales, 2024"
                  />
                </div>
              </div>

              <Separator />

              {/* Import Section */}
              <div className="space-y-2">
                <Label>Import Existing File</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Label htmlFor="import-file" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary">Click to import</span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      Excel (.xlsx, .xls) or CSV (.csv)
                    </span>
                  </Label>
                  <Input
                    id="import-file"
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

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handleDownloadPreview}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Preview
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="w-full"
                >
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
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Spreadsheet Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    Spreadsheet Data
                  </CardTitle>
                  <CardDescription>
                    Edit your spreadsheet data below
                  </CardDescription>
                </div>
                <div className="flex gap-2">
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
            </CardHeader>
            <CardContent>
              {/* Table */}
              <div className="border rounded-lg overflow-auto max-h-[600px]" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-muted" style={{ borderColor: 'var(--border)' }}>
                      <th className="w-12 p-2 text-center text-sm font-medium">#</th>
                      {columns.map((col, colIndex) => (
                        <th key={colIndex} className="p-2 min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <Input
                              value={col}
                              onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                              className="font-semibold text-sm"
                              placeholder={`Column ${colIndex + 1}`}
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
                      <tr key={rowIndex} className="border-b hover:bg-muted/50" style={{ borderColor: 'var(--border)' }}>
                        <td className="p-2 text-center text-sm text-muted-foreground">
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
                              className="w-full"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Badge variant="secondary">{columns.length} Columns</Badge>
                <Badge variant="secondary">{rows.length} Rows</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DocumentCreator;

