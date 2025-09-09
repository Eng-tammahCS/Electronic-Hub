import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, Building, Phone, Mail } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  totalPurchases: number;
  lastPurchaseDate: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "مورد الإلكترونيات الذهبية",
    contactPerson: "أحمد السالم",
    email: "ahmed@golden-electronics.com",
    phone: "966501234567",
    address: "الرياض، حي العليا",
    status: 'active',
    totalPurchases: 125000,
    lastPurchaseDate: "2024-01-15"
  },
  {
    id: "2",
    name: "شركة التقنية المتقدمة",
    contactPerson: "فاطمة أحمد",
    email: "fatma@advanced-tech.com", 
    phone: "966507654321",
    address: "جدة، حي البوادي",
    status: 'active',
    totalPurchases: 89000,
    lastPurchaseDate: "2024-01-12"
  },
  {
    id: "3",
    name: "مؤسسة الأجهزة الحديثة",
    contactPerson: "محمد عبدالله",
    email: "mohammed@modern-devices.com",
    phone: "966551234567",
    address: "الدمام، حي الخليج",
    status: 'inactive',
    totalPurchases: 67500,
    lastPurchaseDate: "2023-12-20"
  }
];

export function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? { label: "نشط", variant: "default" as const }
      : { label: "غير نشط", variant: "secondary" as const };
  };

  const filteredSuppliers = mockSuppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة الموردين</h1>
          <p className="text-muted-foreground mt-2">
            إدارة معلومات الموردين وتتبع المشتريات
          </p>
        </div>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Plus className="h-4 w-4" />
          إضافة مورد جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي الموردين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockSuppliers.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              الموردين النشطين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockSuppliers.filter(s => s.status === 'active').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المشتريات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockSuppliers.reduce((sum, s) => sum + s.totalPurchases, 0).toLocaleString()} ر.س
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              متوسط المشتريات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {Math.round(mockSuppliers.reduce((sum, s) => sum + s.totalPurchases, 0) / mockSuppliers.length).toLocaleString()} ر.س
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right flex items-center gap-2 justify-end">
              <Building className="h-5 w-5" />
              جميع الموردين
            </CardTitle>
            <div className="flex items-center gap-4" dir="rtl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في الموردين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right hover:border-primary focus:border-primary transition-colors w-64"
                />
              </div>
              <Button variant="outline" size="icon" title="تحديث" className="hover:bg-accent">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table dir="rtl" className="hover:bg-muted/50">
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                <TableHead className="text-right font-semibold">آخر شراء</TableHead>
                <TableHead className="text-right font-semibold">إجمالي المشتريات</TableHead>
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">العنوان</TableHead>
                <TableHead className="text-right font-semibold">معلومات الاتصال</TableHead>
                <TableHead className="text-right font-semibold">الشخص المسؤول</TableHead>
                <TableHead className="text-right font-semibold">اسم المورد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد موردين مطابقين للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="تعديل">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{supplier.lastPurchaseDate}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {supplier.totalPurchases.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusBadge(supplier.status).variant} className="font-medium">
                        {getStatusBadge(supplier.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right max-w-xs truncate text-muted-foreground">
                      {supplier.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 justify-end text-sm">
                          <span className="text-blue-600">{supplier.phone}</span>
                          <Phone className="h-3 w-3" />
                        </div>
                        <div className="flex items-center gap-2 justify-end text-sm">
                          <span className="text-blue-600">{supplier.email}</span>
                          <Mail className="h-3 w-3" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{supplier.contactPerson}</TableCell>
                    <TableCell className="text-right font-medium text-blue-600">{supplier.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}