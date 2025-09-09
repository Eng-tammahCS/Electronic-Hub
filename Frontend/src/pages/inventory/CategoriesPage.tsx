import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, Plus, Edit, Trash2, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  productsCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "هواتف ذكية",
    description: "أحدث الهواتف الذكية والأجهزة المحمولة",
    productsCount: 156,
    status: 'active',
    createdAt: "2024-01-10"
  },
  {
    id: "2",
    name: "أجهزة كمبيوتر",
    description: "أجهزة كمبيوتر محمولة ومكتبية",
    productsCount: 89,
    status: 'active',
    createdAt: "2024-01-08"
  },
  {
    id: "3",
    name: "إكسسوارات",
    description: "إكسسوارات وقطع غيار متنوعة",
    productsCount: 234,
    status: 'active',
    createdAt: "2024-01-05"
  },
  {
    id: "4",
    name: "سماعات",
    description: "سماعات سلكية ولاسلكية",
    productsCount: 67,
    status: 'inactive',
    createdAt: "2024-01-03"
  }
];

export function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? { label: "نشط", variant: "default" as const }
      : { label: "غير نشط", variant: "secondary" as const };
  };

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة الفئات</h1>
          <p className="text-muted-foreground mt-2">
            تنظيم وإدارة فئات المنتجات في المتجر
          </p>
        </div>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Plus className="h-4 w-4" />
          إضافة فئة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي الفئات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockCategories.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              الفئات النشطة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockCategories.filter(cat => cat.status === 'active').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المنتجات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockCategories.reduce((sum, cat) => sum + cat.productsCount, 0)}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              متوسط المنتجات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {Math.round(mockCategories.reduce((sum, cat) => sum + cat.productsCount, 0) / mockCategories.length)}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right flex items-center gap-2 justify-end">
              <Tag className="h-5 w-5" />
              جميع الفئات
            </CardTitle>
            <div className="flex items-center gap-4" dir="rtl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في الفئات..."
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
                <TableHead className="text-right font-semibold">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">عدد المنتجات</TableHead>
                <TableHead className="text-right font-semibold">الوصف</TableHead>
                <TableHead className="text-right font-semibold">اسم الفئة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد فئات مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="تعديل">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{category.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusBadge(category.status).variant} className="font-medium">
                        {getStatusBadge(category.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-medium">
                        {category.productsCount} منتج
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right max-w-xs truncate text-muted-foreground">
                      {category.description}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">{category.name}</TableCell>
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