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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { useInventoryReport, useAllInventory, useLowStockItems, useOutOfStockItems, useAdjustInventory } from "@/hooks/useInventory";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { InventoryAdjustmentDto } from "@/services/inventoryService";

export function InventoryPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentData, setAdjustmentData] = useState<Partial<InventoryAdjustmentDto>>({
    newQuantity: 0,
    unitCost: 0,
    reason: ''
  });

  // API hooks
  const { 
    data: inventoryReport, 
    isLoading: isLoadingReport,
    error: reportError 
  } = useInventoryReport();

  const { 
    data: allInventory, 
    isLoading: isLoadingInventory,
    error: inventoryError 
  } = useAllInventory();

  const { 
    data: lowStockItems, 
    isLoading: isLoadingLowStock 
  } = useLowStockItems(5);

  const { 
    data: outOfStockItems, 
    isLoading: isLoadingOutOfStock 
  } = useOutOfStockItems();

  const adjustInventoryMutation = useAdjustInventory();

  // Filter inventory based on search and stock status
  const filteredInventory = (allInventory?.data || []).filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.currentQuantity <= 5 && item.currentQuantity > 0;
    } else if (stockFilter === 'out') {
      matchesStock = item.currentQuantity === 0;
    } else if (stockFilter === 'normal') {
      matchesStock = item.currentQuantity > 5;
    }

    return matchesSearch && matchesStock;
  });

  // Get stock status
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { variant: 'destructive' as const, text: 'نفد', icon: AlertTriangle };
    } else if (quantity <= 5) {
      return { variant: 'secondary' as const, text: 'منخفض', icon: TrendingDown };
    } else {
      return { variant: 'default' as const, text: 'متوفر', icon: TrendingUp };
    }
  };

  // Handle inventory adjustment
  const handleAdjustInventory = async () => {
    if (!selectedProduct || !adjustmentData.newQuantity || !adjustmentData.reason) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await adjustInventoryMutation.mutateAsync({
        productId: selectedProduct.productId,
        newQuantity: adjustmentData.newQuantity!,
        unitCost: adjustmentData.unitCost || selectedProduct.unitCost,
        reason: adjustmentData.reason!
      });

      setAdjustmentData({ newQuantity: 0, unitCost: 0, reason: '' });
      setIsAdjustDialogOpen(false);
      setSelectedProduct(null);
      
      toast({
        title: "تم تسوية المخزون",
        description: `تم تسوية مخزون "${selectedProduct.productName}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في تسوية المخزون",
        description: "حدث خطأ أثناء تسوية المخزون",
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
            إدارة المخزون
          </h1>
          <p className="text-muted-foreground">
            تتبع وإدارة مخزون جميع المنتجات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 ml-2" />
            تقرير مفصل
          </Button>
        </div>
      </div>

      {/* Error Alerts */}
      {(reportError || inventoryError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطأ في تحميل بيانات المخزون: {reportError?.message || inventoryError?.message}
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
            <div className="text-2xl font-bold">
              {inventoryReport?.data?.totalProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              منتجات في المخزون
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inventoryReport?.data?.totalInventoryValue?.toLocaleString() || 0} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة المخزون
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
              {inventoryReport?.data?.lowStockItems || 0}
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
              {inventoryReport?.data?.outOfStockItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              غير متوفر
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
                placeholder="البحث بالاسم، الباركود، الفئة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <select 
              value={stockFilter} 
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">جميع الأنواع</option>
              <option value="normal">متوفر</option>
              <option value="low">منخفض</option>
              <option value="out">نفد</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المخزون ({filteredInventory.length})</CardTitle>
          <CardDescription>
            جميع المنتجات مع حالة المخزون الحالية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInventory ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" text="جاري تحميل المخزون..." />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>المخزون الحالي</TableHead>
                    <TableHead>حالة المخزون</TableHead>
                    <TableHead>سعر التكلفة</TableHead>
                    <TableHead>القيمة الإجمالية</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        لا توجد منتجات تطابق معايير البحث
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item.currentQuantity);
                      const StatusIcon = stockStatus.icon;
                      
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.barcode && `${item.barcode} • `}{item.supplierName || 'بدون مورد'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.categoryName}</TableCell>
                          <TableCell>
                            <span className={item.currentQuantity <= 5 ? 'text-orange-600 font-medium' : ''}>
                              {item.currentQuantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                              <StatusIcon className="h-3 w-3" />
                              {stockStatus.text}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.unitCost.toLocaleString()} ر.س</TableCell>
                          <TableCell className="font-medium">{item.totalValue.toLocaleString()} ر.س</TableCell>
                          <TableCell>
                            <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setAdjustmentData({
                                      newQuantity: item.currentQuantity,
                                      unitCost: item.unitCost,
                                      reason: ''
                                    });
                                  }}
                                >
                                  تسوية
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تسوية مخزون المنتج</DialogTitle>
                                  <DialogDescription>
                                    تعديل كمية المخزون الحالية للمنتج
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedProduct && (
                                  <div className="grid gap-4 py-4">
                                    <div>
                                      <Label>المنتج</Label>
                                      <p className="text-sm font-medium">{selectedProduct.productName}</p>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="newQuantity">الكمية الجديدة *</Label>
                                      <Input
                                        id="newQuantity"
                                        type="number"
                                        value={adjustmentData.newQuantity || ''}
                                        onChange={(e) => setAdjustmentData({...adjustmentData, newQuantity: Number(e.target.value)})}
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="unitCost">سعر التكلفة</Label>
                                      <Input
                                        id="unitCost"
                                        type="number"
                                        step="0.01"
                                        value={adjustmentData.unitCost || ''}
                                        onChange={(e) => setAdjustmentData({...adjustmentData, unitCost: Number(e.target.value)})}
                                        placeholder="0.00"
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="reason">سبب التسوية *</Label>
                                      <Input
                                        id="reason"
                                        value={adjustmentData.reason || ''}
                                        onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                                        placeholder="مثال: جرد دوري، تلف، إلخ"
                                      />
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                                    إلغاء
                                  </Button>
                                  <Button 
                                    onClick={handleAdjustInventory}
                                    disabled={adjustInventoryMutation.isPending}
                                  >
                                    {adjustInventoryMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        جاري التسوية...
                                      </>
                                    ) : (
                                      'تسوية المخزون'
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
