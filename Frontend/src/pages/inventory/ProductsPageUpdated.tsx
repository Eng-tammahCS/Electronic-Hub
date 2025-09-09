import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Download,
  Upload,
  Barcode,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Product, CreateProductRequest } from "@/services/productService";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function ProductsPageUpdated() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<CreateProductRequest>>({
    isActive: true
  });

  // API hooks
  const { 
    data: productsResponse, 
    isLoading: isLoadingProducts, 
    error: productsError,
    refetch: refetchProducts 
  } = useProducts({
    searchTerm: searchTerm || undefined,
    categoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
    isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    page: 1,
    pageSize: 100
  });

  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Extract products from response
  const products = productsResponse?.data || [];
  const isLoading = isLoadingProducts || createProductMutation.isPending || deleteProductMutation.isPending;

  // Filter products based on stock status
  const filteredProducts = products.filter(product => {
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.stockQuantity <= product.minStockLevel;
    } else if (stockFilter === 'out') {
      matchesStock = product.stockQuantity === 0;
    } else if (stockFilter === 'normal') {
      matchesStock = product.stockQuantity > product.minStockLevel;
    }
    return matchesStock;
  });

  // Get stock status
  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { variant: 'destructive' as const, text: 'نفد' };
    } else if (product.stockQuantity <= product.minStockLevel) {
      return { variant: 'secondary' as const, text: 'منخفض' };
    } else {
      return { variant: 'default' as const, text: 'متوفر' };
    }
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="default">نشط</Badge> : 
      <Badge variant="secondary">غير نشط</Badge>;
  };

  // Add new product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId || !newProduct.supplierId) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await createProductMutation.mutateAsync(newProduct as CreateProductRequest);
      setNewProduct({ isActive: true });
      setIsAddDialogOpen(false);
      
      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة "${newProduct.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في إضافة المنتج",
        description: "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive"
      });
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في حذف المنتج",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive"
      });
    }
  };

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="جاري التحقق من الصلاحيات..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            إدارة المنتجات
          </h1>
          <p className="text-muted-foreground">
            إدارة كاملة لجميع منتجات المتجر
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 ml-2" />
            استيراد
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المنتج الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">اسم المنتج *</Label>
                    <Input
                      id="name"
                      value={newProduct.name || ''}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="اسم المنتج"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku || ''}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      placeholder="SKU"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="وصف المنتج"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">سعر البيع *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost">سعر التكلفة</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newProduct.cost || ''}
                      onChange={(e) => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="barcode">الباركود</Label>
                    <Input
                      id="barcode"
                      value={newProduct.barcode || ''}
                      onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                      placeholder="رقم الباركود"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stockQuantity">المخزون الحالي</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={newProduct.stockQuantity || ''}
                      onChange={(e) => setNewProduct({...newProduct, stockQuantity: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minStockLevel">الحد الأدنى</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={newProduct.minStockLevel || ''}
                      onChange={(e) => setNewProduct({...newProduct, minStockLevel: Number(e.target.value)})}
                      placeholder="5"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxStockLevel">الحد الأقصى</Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      value={newProduct.maxStockLevel || ''}
                      onChange={(e) => setNewProduct({...newProduct, maxStockLevel: Number(e.target.value)})}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoryId">الفئة *</Label>
                    <Input
                      id="categoryId"
                      type="number"
                      value={newProduct.categoryId || ''}
                      onChange={(e) => setNewProduct({...newProduct, categoryId: Number(e.target.value)})}
                      placeholder="معرف الفئة"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplierId">المورد *</Label>
                    <Input
                      id="supplierId"
                      type="number"
                      value={newProduct.supplierId || ''}
                      onChange={(e) => setNewProduct({...newProduct, supplierId: Number(e.target.value)})}
                      placeholder="معرف المورد"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleAddProduct}
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة المنتج'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {productsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطأ في تحميل المنتجات: {productsError.message}
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => refetchProducts()}
            >
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              +{products.filter(p => p.isActive).length} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              يحتاج إعادة تموين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نفد المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stockQuantity === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              غير متوفر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + (p.stockQuantity * p.cost), 0).toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة المخزون
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم، SKU، الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="المخزون" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="normal">متوفر</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="out">نفد</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات ({filteredProducts.length})</CardTitle>
          <CardDescription>
            جميع منتجات المتجر مع إمكانية البحث والتصفية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" text="جاري تحميل المنتجات..." />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>سعر البيع</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead>حالة المخزون</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {products.length === 0 ? 'لا توجد منتجات' : 'لا توجد منتجات تطابق معايير البحث'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.sku} • {product.categoryName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{product.categoryName || '-'}</TableCell>
                          <TableCell className="font-medium">{product.price.toLocaleString()} ر.س</TableCell>
                          <TableCell>
                            <span className={product.stockQuantity <= product.minStockLevel ? 'text-orange-600 font-medium' : ''}>
                              {product.stockQuantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.text}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(product.isActive)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>تفاصيل المنتج</DialogTitle>
                                    <DialogDescription>
                                      عرض تفصيلي لبيانات المنتج
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedProduct && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="font-medium text-muted-foreground">اسم المنتج</p>
                                          <p>{selectedProduct.name}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-muted-foreground">رمز المنتج</p>
                                          <p>{selectedProduct.sku || '-'}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-muted-foreground">الفئة</p>
                                          <p>{selectedProduct.categoryName || '-'}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-muted-foreground">المورد</p>
                                          <p>{selectedProduct.supplierName || '-'}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-muted-foreground">سعر التكلفة</p>
                                          <p>{selectedProduct.cost.toLocaleString()} ر.س</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-muted-foreground">سعر البيع</p>
                                          <p className="text-lg font-bold text-primary">
                                            {selectedProduct.price.toLocaleString()} ر.س
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-muted-foreground">المخزون الحالي</p>
                                          <p>{selectedProduct.stockQuantity}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-muted-foreground">الحد الأدنى</p>
                                          <p>{selectedProduct.minStockLevel}</p>
                                        </div>
                                      </div>
                                      {selectedProduct.description && (
                                        <div>
                                          <p className="font-medium text-muted-foreground mb-1">الوصف</p>
                                          <p className="text-sm">{selectedProduct.description}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deleteProductMutation.isPending}
                              >
                                {deleteProductMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
