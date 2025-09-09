import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Image, Settings, Building2, Calendar, Package, DollarSign } from 'lucide-react';
import { Product } from '@/services/productService';

interface PDFExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

interface ExportSettings {
  fileName: string;
  includeLogo: boolean;
  logoUrl: string;
  companyName: string;
  reportTitle: string;
  includeSummary: boolean;
  includeDetails: boolean;
  format: 'pdf' | 'excel';
}

export function PDFExportDialog({ isOpen, onClose, products }: PDFExportDialogProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    fileName: `تقرير_المنتجات_${new Date().toLocaleDateString('ar-SA')}`,
    includeLogo: true,
    logoUrl: '',
    companyName: 'متجر الإلكترونيات',
    reportTitle: 'تقرير شامل للمنتجات',
    includeSummary: true,
    includeDetails: true,
    format: 'pdf'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      if (settings.format === 'pdf') {
        await generatePDF();
      } else {
        await generateExcel();
      }
      
      // إظهار رسالة نجاح
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    // إنشاء محتوى HTML للـ PDF
    const htmlContent = generateHTMLContent();
    
    // إنشاء نافذة جديدة لطباعة المحتوى
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // انتظار تحميل المحتوى ثم طباعته كـ PDF
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  const generateExcel = async () => {
    // إنشاء بيانات CSV للتصدير
    const csvContent = generateCSVContent();
    
    // تحميل الملف
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${settings.fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateHTMLContent = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.defaultSellingPrice * product.currentQuantity), 0);
    const lowStockProducts = products.filter(p => p.currentQuantity < 10).length;

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${settings.reportTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Cairo', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .header-content {
            position: relative;
            z-index: 1;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #667eea;
            font-weight: bold;
          }
          
          .company-name {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .report-title {
            font-size: 24px;
            font-weight: 400;
            opacity: 0.9;
          }
          
          .date-info {
            margin-top: 20px;
            font-size: 16px;
            opacity: 0.8;
          }
          
          .summary-section {
            padding: 40px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin-top: 30px;
          }
          
          .summary-card {
            background: rgba(255,255,255,0.2);
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
          }
          
          .summary-number {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .summary-label {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .products-section {
            padding: 40px;
          }
          
          .section-title {
            font-size: 28px;
            font-weight: 600;
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            position: relative;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
          }
          
          .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          
          .products-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: right;
            font-weight: 600;
            font-size: 16px;
          }
          
          .products-table td {
            padding: 15px 20px;
            border-bottom: 1px solid #f0f0f0;
            text-align: right;
          }
          
          .products-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .products-table tr:hover {
            background: #e3f2fd;
            transform: scale(1.01);
            transition: all 0.3s ease;
          }
          
          .product-name {
            font-weight: 600;
            color: #333;
          }
          
          .category-badge {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .supplier-badge {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .price {
            font-weight: 600;
            color: #2e7d32;
          }
          
          .quantity {
            font-weight: 600;
          }
          
          .quantity.low {
            color: #d32f2f;
          }
          
          .quantity.medium {
            color: #f57c00;
          }
          
          .quantity.high {
            color: #2e7d32;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            border-top: 3px solid #667eea;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
          }
          
          .footer-info {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .footer-icon {
            width: 20px;
            height: 20px;
            color: #667eea;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              border-radius: 0;
            }
            
            .products-table tr:hover {
              transform: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-content">
              <div class="logo">${settings.companyName.charAt(0)}</div>
              <h1 class="company-name">${settings.companyName}</h1>
              <h2 class="report-title">${settings.reportTitle}</h2>
              <div class="date-info">
                <strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
            </div>
          </div>
          
          ${settings.includeSummary ? `
          <div class="summary-section">
            <h2 style="font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 20px;">ملخص التقرير</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-number">${totalProducts}</div>
                <div class="summary-label">إجمالي المنتجات</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${totalValue.toLocaleString('ar-SA')} ر.س</div>
                <div class="summary-label">القيمة الإجمالية</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${lowStockProducts}</div>
                <div class="summary-label">منتجات قليلة المخزون</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${products.filter(p => p.currentQuantity > 50).length}</div>
                <div class="summary-label">منتجات عالية المخزون</div>
              </div>
            </div>
          </div>
          ` : ''}
          
          ${settings.includeDetails ? `
          <div class="products-section">
            <h2 class="section-title">تفاصيل المنتجات</h2>
            <table class="products-table">
              <thead>
                <tr>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>المورد</th>
                  <th>الفئة</th>
                  <th>الباركود</th>
                  <th>اسم المنتج</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(product => `
                  <tr>
                    <td>
                      <span class="quantity ${product.currentQuantity < 10 ? 'low' : product.currentQuantity < 50 ? 'medium' : 'high'}">
                        ${product.currentQuantity}
                      </span>
                    </td>
                    <td class="price">${product.defaultSellingPrice.toLocaleString('ar-SA')} ر.س</td>
                    <td>
                      ${product.supplierName ? `<span class="supplier-badge">${product.supplierName}</span>` : '<span style="color: #999;">بدون مورد</span>'}
                    </td>
                    <td><span class="category-badge">${product.categoryName}</span></td>
                    <td>${product.barcode || '-'}</td>
                    <td class="product-name">${product.name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div class="footer">
            <div class="footer-content">
              <div class="footer-info">
                <span>تم إنشاء التقرير بواسطة نظام إدارة المخزون</span>
              </div>
              <div class="footer-info">
                <span>${new Date().toLocaleString('ar-SA')}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateCSVContent = () => {
    const headers = ['اسم المنتج', 'الباركود', 'الفئة', 'المورد', 'سعر البيع', 'الكمية الحالية', 'تاريخ الإنشاء'];
    const csvRows = [headers.join(',')];
    
    products.forEach(product => {
      const row = [
        `"${product.name}"`,
        `"${product.barcode || ''}"`,
        `"${product.categoryName}"`,
        `"${product.supplierName || ''}"`,
        product.defaultSellingPrice,
        product.currentQuantity,
        new Date(product.createdAt).toLocaleDateString('ar-SA')
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-blue-600" />
            تصدير تقرير المنتجات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* إعدادات التصدير */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات التصدير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">اسم الملف</Label>
                  <Input
                    id="fileName"
                    value={settings.fileName}
                    onChange={(e) => setSettings({...settings, fileName: e.target.value})}
                    placeholder="اسم الملف"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="format">نوع الملف</Label>
                  <Select value={settings.format} onValueChange={(value: 'pdf' | 'excel') => setSettings({...settings, format: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel (CSV)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">اسم الشركة</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  placeholder="اسم الشركة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportTitle">عنوان التقرير</Label>
                <Input
                  id="reportTitle"
                  value={settings.reportTitle}
                  onChange={(e) => setSettings({...settings, reportTitle: e.target.value})}
                  placeholder="عنوان التقرير"
                />
              </div>
            </CardContent>
          </Card>

          {/* خيارات المحتوى */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                خيارات المحتوى
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeSummary"
                  checked={settings.includeSummary}
                  onChange={(e) => setSettings({...settings, includeSummary: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="includeSummary">تضمين ملخص التقرير</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeDetails"
                  checked={settings.includeDetails}
                  onChange={(e) => setSettings({...settings, includeDetails: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="includeDetails">تضمين تفاصيل المنتجات</Label>
              </div>
            </CardContent>
          </Card>

          {/* معاينة البيانات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                معاينة البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-sm text-gray-600">إجمالي المنتجات</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {products.reduce((sum, p) => sum + (p.defaultSellingPrice * p.currentQuantity), 0).toLocaleString('ar-SA')} ر.س
                  </div>
                  <div className="text-sm text-gray-600">القيمة الإجمالية</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {products.filter(p => p.currentQuantity < 10).length}
                  </div>
                  <div className="text-sm text-gray-600">قليلة المخزون</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {products.filter(p => p.currentQuantity > 50).length}
                  </div>
                  <div className="text-sm text-gray-600">عالية المخزون</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            إلغاء
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                تصدير {settings.format === 'pdf' ? 'PDF' : 'Excel'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
