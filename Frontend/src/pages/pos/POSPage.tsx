import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Package
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  category: string;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

// Mock data for demonstration
const mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Pro', price: 4500, stock: 25, barcode: '12345678', category: 'هواتف' },
  { id: '2', name: 'Samsung Galaxy S24', price: 3200, stock: 15, barcode: '12345679', category: 'هواتف' },
  { id: '3', name: 'MacBook Air M2', price: 8500, stock: 8, barcode: '12345680', category: 'لابتوب' },
  { id: '4', name: 'Dell XPS 13', price: 6500, stock: 12, barcode: '12345681', category: 'لابتوب' },
  { id: '5', name: 'AirPods Pro', price: 950, stock: 30, barcode: '12345682', category: 'اكسسوارات' },
  { id: '6', name: 'سماعات Sony WH-1000XM5', price: 1200, stock: 20, barcode: '12345683', category: 'اكسسوارات' },
];

const mockCustomers: Customer[] = [
  { id: '1', name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@example.com' },
  { id: '2', name: 'فاطمة علي', phone: '0507654321', email: 'fatima@example.com' },
  { id: '3', name: 'محمد السعيد', phone: '0551112233' },
];

export function POSPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [discount, setDiscount] = useState(0);
  const [tax] = useState(15); // VAT 15%
  const { toast } = useToast();

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category.includes(searchTerm)
  );

  // Filter customers based on search
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.includes(customerSearch) ||
    customer.phone.includes(customerSearch)
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.stock === 0) {
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
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "تجاوز المخزون المتاح",
            description: `الحد الأقصى المتاح: ${product.stock}`,
            variant: "destructive"
          });
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
            : item
        );
      } else {
        return [...prevCart, { 
          product, 
          quantity: 1, 
          subtotal: product.price 
        }];
      }
    });
  };

  // Update quantity in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast({
        title: "تجاوز المخزون المتاح",
        description: `الحد الأقصى المتاح: ${product.stock}`,
        variant: "destructive"
      });
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.price }
          : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setPaymentMethod('cash');
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (tax / 100);
  const total = taxableAmount + taxAmount;

  // Process sale
  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: "سلة فارغة",
        description: "يرجى إضافة منتجات للسلة أولاً",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "تم إتمام البيع بنجاح",
        description: `فاتورة رقم #INV-${Date.now()} بقيمة ${total.toFixed(2)} ر.س`,
        duration: 5000
      });
      clearCart();
    }, 1000);
  };

  // Keyboard shortcuts
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
        setShowCustomerSearch(!showCustomerSearch);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showCustomerSearch]);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            نقطة البيع (POS)
          </h1>
          <p className="text-muted-foreground">
            نظام البيع والفوترة السريع
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowCustomerSearch(!showCustomerSearch)}>
            <Users className="h-4 w-4 ml-2" />
            العملاء (F3)
          </Button>
          <Button variant="outline" size="sm" onClick={clearCart}>
            <Trash2 className="h-4 w-4 ml-2" />
            مسح الكل (F1)
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث عن منتج... (الاسم، الباركود، الفئة)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>

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

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                        {product.stock > 0 ? `${product.stock} متوفر` : 'نفد'}
                      </Badge>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} ر.س</p>
                      <Button size="sm" disabled={product.stock === 0}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          {/* Cart Items */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                سلة المشتريات ({cart.length})
              </CardTitle>
              {selectedCustomer && (
                <div className="text-sm text-muted-foreground">
                  العميل: {selectedCustomer.name}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>السلة فارغة</p>
                  <p className="text-xs">اختر المنتجات لإضافتها</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.product.price.toLocaleString()} ر.س</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Discount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">خصم (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                      placeholder="0"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">طريقة الدفع</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <Banknote className="h-4 w-4 ml-1" />
                        نقدي
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('card')}
                      >
                        <CreditCard className="h-4 w-4 ml-1" />
                        بطاقة
                      </Button>
                      <Button
                        variant={paymentMethod === 'mixed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('mixed')}
                      >
                        <Calculator className="h-4 w-4 ml-1" />
                        مختلط
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{subtotal.toFixed(2)} ر.س</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>خصم ({discount}%):</span>
                        <span>-{discountAmount.toFixed(2)} ر.س</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>ضريبة القيمة المضافة ({tax}%):</span>
                      <span>{taxAmount.toFixed(2)} ر.س</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-primary">{total.toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base"
                    onClick={processSale}
                  >
                    <Receipt className="h-4 w-4 ml-2" />
                    إتمام البيع (F2)
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">اختصارات لوحة المفاتيح</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-muted-foreground">
              <div>F1: مسح الكل</div>
              <div>F2: إتمام البيع</div>
              <div>F3: البحث في العملاء</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}