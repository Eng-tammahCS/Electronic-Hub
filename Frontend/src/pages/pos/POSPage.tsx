import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Calculator,
  CreditCard,
  Banknote,
  Receipt,
  Scan,
  Users,
  Package,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useProducts, useProductsByCategory } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCreateSale } from "@/hooks/useSales";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { API_CONFIG } from "@/config/api";
import { PaymentMethod } from "@/services/apiService";
import { salesService } from "@/services/salesService";

// Import Product type from productService
import { Product } from "@/services/productService";

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

export function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [discount, setDiscount] = useState(0);
  const [tax] = useState(15); // VAT 15%
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const { toast } = useToast();

  // Fetch categories
  const { 
    data: categoriesResponse, 
    isLoading: isLoadingCategories, 
    error: categoriesError,
    refetch: refetchCategories
  } = useCategories();

  const categories = categoriesResponse?.data || [];

  // Fetch products from API - either all products or filtered by category
  const { 
    data: productsResponse, 
    isLoading: isLoadingProducts, 
    error: productsError,
    refetch: refetchProducts 
  } = selectedCategoryId 
    ? useProductsByCategory(selectedCategoryId, { page: 1, pageSize: 100 })
    : useProducts({ page: 1, pageSize: 100 });

  const originalProducts = productsResponse?.data || [];
  
  // Local products state for UI updates (stock changes)
  const [products, setProducts] = useState<Product[]>([]);
  
  // Update local products when original products change
  useEffect(() => {
    setProducts(originalProducts);
  }, [originalProducts]);

  // Fetch customers from API
  const { data: customersData, isLoading: customersLoading, refetch: fetchCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.CUSTOMERS);
        if (response.success && response.data && response.data.length > 0) {
          return response.data.map(customer => ({
            ...customer,
            firstOrderDate: new Date(customer.firstOrderDate).toISOString(),
            lastOrderDate: new Date(customer.lastOrderDate).toISOString()
          }));
        }
        return [];
      } catch (error) {
        console.warn('API not available, using empty customers list:', error);
        return [];
      }
    },
    enabled: false, // Don't fetch automatically
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create sale mutation
  const createSaleMutation = useCreateSale();

  // Handle category selection
  const handleCategorySelect = (categoryId: number | null) => {
    if (categoryId === null) {
      // Show all products in main view
      setSelectedCategoryId(null);
      setSearchTerm('');
      setIsCategoryDialogOpen(false);
      setSelectedCategory(null);
    } else {
      // Open category dialog
      const category = categories.find(c => c.id === categoryId);
      setSelectedCategory(category);
      setIsCategoryDialogOpen(true);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm)) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ar');
        case 'price':
          return a.defaultSellingPrice - b.defaultSellingPrice;
        case 'stock':
          return b.currentQuantity - a.currentQuantity; // Higher stock first
        default:
          return 0;
      }
    });

  // Filter customers based on search
  const filteredCustomers = (customersData || []).filter(customer =>
    customer.name.includes(customerSearch) ||
    customer.phone.includes(customerSearch)
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.currentQuantity === 0) {
      toast({
        title: "نفاد المخزون",
        description: "هذا المنتج غير متوفر حالياً",
        variant: "destructive"
      });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.currentQuantity) {
          toast({
            title: "تجاوز المخزون المتاح",
            description: `الحد الأقصى المتاح: ${product.currentQuantity}`,
            variant: "destructive"
          });
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.defaultSellingPrice }
            : item
        );
      } else {
        return [...prevCart, { 
          product, 
          quantity: 1, 
          subtotal: product.defaultSellingPrice 
        }];
      }
    });

    // Update product stock in the products array (UI only - not saved to database yet)
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === product.id 
          ? { ...p, currentQuantity: p.currentQuantity - 1 }
          : p
      )
    );
  };

  // Update quantity in cart
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.currentQuantity) {
      toast({
        title: "تجاوز المخزون المتاح",
        description: `الحد الأقصى المتاح: ${product.currentQuantity}`,
        variant: "destructive"
      });
      return;
    }

    const existingItem = cart.find(item => item.product.id === productId);
    if (existingItem) {
      const quantityDifference = newQuantity - existingItem.quantity;
      
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.defaultSellingPrice }
            : item
        )
      );

      // Update product stock in the products array (UI only - not saved to database yet)
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId 
            ? { ...p, currentQuantity: p.currentQuantity - quantityDifference }
            : p
        )
      );
    }
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    const cartItem = cart.find(item => item.product.id === productId);
    
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    
    // Restore stock in the products array (UI only - not saved to database yet)
    if (cartItem) {
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId 
            ? { ...p, currentQuantity: p.currentQuantity + cartItem.quantity }
            : p
        )
      );
    }
  };

  // Clear cart
  const clearCart = () => {
    // Restore all stock in the products array (UI only - not saved to database yet)
    setProducts(prevProducts => 
      prevProducts.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        return cartItem 
          ? { ...p, currentQuantity: p.currentQuantity + cartItem.quantity }
          : p;
      })
    );
    
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setPaymentMethod(PaymentMethod.Cash);
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (tax / 100);
  const total = taxableAmount + taxAmount;

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "سلة فارغة",
        description: "يرجى إضافة منتجات للسلة أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Generate invoice number
      const invoiceNumber = salesService.generateInvoiceNumber();
      
      // Prepare sale data - matching backend DTO structure
      const saleData = {
        invoiceNumber,
        customerName: selectedCustomer?.name ?? null,
        invoiceDate: new Date().toISOString(),
        discountTotal: discountAmount,
        paymentMethod: paymentMethod,
        details: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.defaultSellingPrice,
          discountAmount: 0 // Individual item discount (can be extended later)
        }))
      };

      console.log('Sending sale data:', saleData);
      console.log('Payment method value:', paymentMethod);
      console.log('Payment method type:', typeof paymentMethod);
      console.log('Cart items:', cart);
      console.log('Discount amount:', discountAmount);
      console.log('Total:', total);

      // Validate data before sending
      if (!saleData.invoiceNumber || saleData.details.length === 0) {
        throw new Error('بيانات الفاتورة غير صحيحة');
      }

      // Create sale
      const result = await createSaleMutation.mutateAsync(saleData);
      
      console.log('Sale result:', result);

      if (result.success) {
        toast({
          title: "تم إتمام البيع بنجاح",
          description: `فاتورة رقم ${invoiceNumber} بقيمة ${total.toFixed(2)} ر.س`,
          duration: 5000
        });
        
        // Clear cart and reset form
        clearCart();
        
        // Refresh products to update stock
        refetchProducts();
        
        // Refresh categories to update product counts
        refetchCategories();
      } else {
        throw new Error(result.message || 'فشل في إتمام البيع');
      }
    } catch (error: any) {
      console.error('Sale processing error:', error);
      toast({
        title: "خطأ في إتمام البيع",
        description: error.message || 'حدث خطأ غير متوقع',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle customers button click
  const handleCustomersClick = async () => {
    try {
      await fetchCustomers();
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast({
        title: "خطأ في تحميل العملاء",
        description: "فشل في تحميل قائمة العملاء",
        variant: "destructive"
      });
    }
  };

  // Keyboard shortcuts and touch optimizations
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F2') {
        e.preventDefault();
        processSale();
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleCustomersClick();
      } else if (e.key === 'Escape') {
        setSearchTerm('');
        setSelectedCategoryId(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);


  return (
    <div className="h-screen flex flex-col gap-4 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            نقطة البيع (POS)
          </h1>
          <p className="text-muted-foreground">
            نظام البيع والفوترة السريع
            {selectedCategoryId && (
              <span className="ml-2 text-primary">
                - {categories.find(c => c.id === selectedCategoryId)?.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCustomersClick}
            disabled={customersLoading}
          >
            <Users className="h-4 w-4 ml-2" />
            {customersLoading ? "جاري التحميل..." : "العملاء (F3)"}
          </Button>
          <Button variant="outline" size="sm" onClick={clearCart}>
            <Trash2 className="h-4 w-4 ml-2" />
            مسح الكل (F1)
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Fixed Search Bar */}
          <div className="flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث عن منتج..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scrollable Categories Section */}
          <div className="flex-1 overflow-y-auto min-h-0 mt-4">
            <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  الفئات
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedCategoryId && (
                    <Badge variant="secondary" className="text-xs">
                      {filteredProducts.length} منتج
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {categories.length} فئة
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">جاري تحميل الفئات...</span>
                </div>
              ) : categoriesError ? (
                <div className="flex items-center justify-center py-6">
                  <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                  <span className="text-sm text-destructive">خطأ في تحميل الفئات</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* All Categories Button - Prominent */}
                  <div className="border-b pb-3">
                    <Button
                      variant={selectedCategoryId === null ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleCategorySelect(null)}
                      className="w-full justify-start h-12 text-base font-semibold"
                    >
                      <Package className="h-5 w-5 ml-2" />
                      جميع المنتجات
                      <Badge variant="secondary" className="mr-auto text-sm">
                        {products.length}
                      </Badge>
                    </Button>
                  </div>
                  
                  {/* Categories Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                    {categories
                      .sort((a, b) => {
                        // Sort by product count (descending) then by name
                        const aCount = products.filter(p => p.categoryId === a.id).length;
                        const bCount = products.filter(p => p.categoryId === b.id).length;
                        if (aCount !== bCount) return bCount - aCount;
                        return a.name.localeCompare(b.name, 'ar');
                      })
                      .map((category) => {
                        const categoryProductCount = products.filter(p => p.categoryId === category.id).length;
                        const isSelected = selectedCategoryId === category.id;
                        
                        return (
                          <Button
                            key={category.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCategorySelect(category.id)}
                            className={`h-auto p-2 flex flex-col items-center gap-1 ${
                              isSelected ? 'ring-2 ring-primary/20' : ''
                            }`}
                          >
                            <div className="flex items-center gap-1 w-full">
                              <Package className="h-3 w-3" />
                              <span className="text-xs font-medium truncate flex-1 text-right">
                                {category.name}
                              </span>
                            </div>
                            <Badge 
                              variant={categoryProductCount > 0 ? "secondary" : "destructive"} 
                              className="text-xs px-1 py-0"
                            >
                              {categoryProductCount}
                            </Badge>
                          </Button>
                        );
                      })}
                  </div>
                  
                  {/* Empty state for categories with no products */}
                  {categories.filter(cat => products.filter(p => p.categoryId === cat.id).length === 0).length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground text-center">
                        {categories.filter(cat => products.filter(p => p.categoryId === cat.id).length === 0).length} فئة بدون منتجات
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Customer Search */}
          {showCustomerSearch && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">العملاء</CardTitle>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث عن عميل..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerSearch(false);
                    }}
                  >
                    <div>
                      <p className="font-medium">عميل عادي</p>
                      <p className="text-sm text-muted-foreground">بدون تسجيل</p>
                    </div>
                    {!selectedCustomer && <Badge variant="default">مختار</Badge>}
                  </div>
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerSearch(false);
                      }}
                    >
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                      {selectedCustomer?.id === customer.id && <Badge variant="default">مختار</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Cart Section - Creative Design */}
        <div className="w-80 sticky top-4 self-start h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="space-y-2">
            
            {/* Compact Cart Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">السلة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {cart.length}
                  </Badge>
                  {selectedCustomer && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {selectedCustomer.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Items - Compact Design */}
            {cart.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-6 text-center border-2 border-dashed border-muted-foreground/30">
                <ShoppingCart className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">السلة فارغة</p>
                <p className="text-xs text-muted-foreground/70 mt-1">اختر المنتجات لإضافتها</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-card border rounded-lg p-3 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1 mb-1">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product.defaultSellingPrice.toLocaleString()} ر.س
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium bg-muted px-1 py-0.5 rounded">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">المجموع</span>
                      <span className="text-sm font-semibold text-primary">
                        {(item.quantity * item.product.defaultSellingPrice).toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compact Order Controls */}
            {cart.length > 0 && (
              <div className="space-y-2">
                {/* Discount & Payment - Compact */}
                <div className="bg-muted/20 rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground">خصم</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                      placeholder="0"
                      className="h-7 text-xs text-center w-16"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant={paymentMethod === PaymentMethod.Cash ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod(PaymentMethod.Cash)}
                      className="flex-1 h-7 text-xs"
                    >
                      <Banknote className="h-3 w-3 ml-1" />
                      نقدي
                    </Button>
                    <Button
                      variant={paymentMethod === PaymentMethod.Card ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod(PaymentMethod.Card)}
                      className="flex-1 h-7 text-xs"
                    >
                      <CreditCard className="h-3 w-3 ml-1" />
                      بطاقة
                    </Button>
                  </div>
                </div>

                {/* Compact Totals */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المجموع الفرعي:</span>
                      <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>خصم ({discount}%):</span>
                        <span className="font-medium">-{discountAmount.toFixed(2)} ر.س</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ضريبة ({tax}%):</span>
                      <span className="font-medium">{taxAmount.toFixed(2)} ر.س</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-primary">{total.toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-10 text-sm font-semibold mt-3"
                    onClick={processSale}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <Receipt className="h-4 w-4 ml-2" />
                        إتمام البيع (F2)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Compact Keyboard Shortcuts */}
            <div className="bg-muted/10 rounded-lg p-2">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span className="font-mono">F1</span>
                  <span>مسح الكل</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">F2</span>
                  <span>إتمام البيع</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">F3</span>
                  <span>البحث في العملاء</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Products Dialog - Dynamic size based on product count */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className={`max-w-[90vw] max-h-[90vh] overflow-hidden ${
          selectedCategory && products.filter(p => p.categoryId === selectedCategory.id).length <= 6
            ? 'w-[400px] h-[400px]' // Smaller for few products
            : 'w-[600px] h-[600px]' // Default size for many products
        }`}>
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="h-4 w-4" />
              {selectedCategory?.name}
            </DialogTitle>
            
            {/* Sort options in dialog - only show if there are products */}
            {selectedCategory && products.filter(p => p.categoryId === selectedCategory.id).length > 0 && (
              <div className="flex gap-1">
                <Button
                  variant={sortBy === 'name' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy('name')}
                  className="text-xs px-2 py-1 h-7"
                >
                  الاسم
                </Button>
                <Button
                  variant={sortBy === 'price' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy('price')}
                  className="text-xs px-2 py-1 h-7"
                >
                  السعر
                </Button>
                <Button
                  variant={sortBy === 'stock' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy('stock')}
                  className="text-xs px-2 py-1 h-7"
                >
                  المخزون
                </Button>
              </div>
            )}
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {selectedCategory && (() => {
              const categoryProducts = products.filter(product => product.categoryId === selectedCategory.id);
              
              if (categoryProducts.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      لا توجد منتجات
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      هذه الفئة لا تحتوي على أي منتجات حالياً
                    </p>
                  </div>
                );
              }

              return (
                <div className={`grid gap-2 ${
                  categoryProducts.length <= 6 
                    ? 'grid-cols-2' // 2 columns for few products
                    : 'grid-cols-3' // 3 columns for many products
                }`}>
                  {categoryProducts
                    .sort((a, b) => {
                      switch (sortBy) {
                        case 'name':
                          return a.name.localeCompare(b.name, 'ar');
                        case 'price':
                          return a.defaultSellingPrice - b.defaultSellingPrice;
                        case 'stock':
                          return b.currentQuantity - a.currentQuantity;
                        default:
                          return 0;
                      }
                    })
                    .map(product => {
                      const isOutOfStock = product.currentQuantity === 0;
                      const isLowStock = product.currentQuantity > 0 && product.currentQuantity <= 5;

                      return (
                        <Card
                          key={product.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                            isOutOfStock 
                              ? 'opacity-50 cursor-not-allowed border-red-200' 
                              : isLowStock 
                                ? 'border-yellow-200 hover:border-yellow-300' 
                                : 'border-gray-200 hover:border-primary/50'
                          }`}
                          onClick={() => !isOutOfStock && addToCart(product)}
                        >
                          <CardContent className="p-2">
                            <div className="space-y-1">
                              {/* Stock indicator */}
                              <div className="flex items-center justify-between">
                                <div className={`w-2 h-2 rounded-full ${
                                  isOutOfStock ? 'bg-red-500' : 
                                  isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                                <span className="text-xs text-muted-foreground">
                                  {product.currentQuantity}
                                </span>
                              </div>

                              {/* Product name */}
                              <h3 className="font-medium text-xs line-clamp-2 leading-tight">
                                {product.name}
                              </h3>

                              {/* Price */}
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-primary">
                                  {product.defaultSellingPrice.toLocaleString()} ر.س
                                </p>
                                <Button 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  disabled={isOutOfStock}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isOutOfStock) addToCart(product);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              );
            })()}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCategoryDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}