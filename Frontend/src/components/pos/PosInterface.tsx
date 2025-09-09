import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Calculator,
  CreditCard,
  Banknote,
  X,
  User
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { API_CONFIG } from "@/config/api";

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: "لابتوب ديل XPS 13",
    price: 4500,
    category: "أجهزة كمبيوتر",
    stock: 15,
    image: "💻"
  },
  {
    id: 2,
    name: "آيفون 15 برو",
    price: 4200,
    category: "هواتف",
    stock: 8,
    image: "📱"
  },
  {
    id: 3,
    name: "سماعات AirPods Pro",
    price: 850,
    category: "إكسسوارات",
    stock: 25,
    image: "🎧"
  },
  {
    id: 4,
    name: "تابلت آيباد برو",
    price: 3200,
    category: "أجهزة لوحية",
    stock: 12,
    image: "📱"
  },
  {
    id: 5,
    name: "ماوس لاسلكي",
    price: 120,
    category: "إكسسوارات",
    stock: 50,
    image: "🖱️"
  },
  {
    id: 6,
    name: "كيبورد ميكانيكي",
    price: 350,
    category: "إكسسوارات",
    stock: 30,
    image: "⌨️"
  },
  {
    id: 7,
    name: "شاشة 27 بوصة",
    price: 1800,
    category: "شاشات",
    stock: 10,
    image: "🖥️"
  },
  {
    id: 8,
    name: "كاميرا كانون",
    price: 2800,
    category: "كاميرات",
    stock: 5,
    image: "📷"
  }
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

interface PosInterfaceProps {
  onClose?: () => void;
}

export function PosInterface({ onClose }: PosInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walk-in");
  const [customCustomerName, setCustomCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mixed">("cash");

  // Fetch customers from API - only when requested
  const { data: customersData, isLoading: customersLoading, refetch: fetchCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('API call started for customers...');
        const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.CUSTOMERS);
        console.log('API response:', response);
        if (response.success && response.data && response.data.length > 0) {
          // Transform API data to match our interface
          const transformedData = response.data.map(customer => ({
            ...customer,
            firstOrderDate: new Date(customer.firstOrderDate).toISOString(),
            lastOrderDate: new Date(customer.lastOrderDate).toISOString()
          }));
          console.log('Transformed customers data:', transformedData);
          return transformedData;
        }
        console.log('No customers data found');
        return [];
      } catch (error) {
        console.warn('API not available, using empty customers list:', error);
        return [];
      }
    },
    enabled: false, // Don't fetch automatically
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter products
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(mockProducts.map(p => p.category)))];

  // Get selected customer name
  const getSelectedCustomerName = () => {
    if (selectedCustomerId === "walk-in") {
      return customCustomerName || "عميل عادي";
    }
    const customer = customersData?.find(c => c.id.toString() === selectedCustomerId);
    return customer?.name || "عميل عادي";
  };

  // Handle customers button click
  const handleCustomersClick = async () => {
    try {
      console.log('Fetching customers...');
      const result = await fetchCustomers();
      console.log('Customers fetched:', result);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  // Handle F3 key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F3') {
        event.preventDefault();
        handleCustomersClick();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Cart functions
  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const customerName = getSelectedCustomerName();
    
    // Here you would typically send the order to the API
    console.log("Processing order:", {
      customerName,
      customerId: selectedCustomerId === "walk-in" ? null : selectedCustomerId,
      items: cart,
      subtotal,
      tax,
      total,
      paymentMethod
    });
    
    // Reset form
    setCart([]);
    setSelectedCustomerId("walk-in");
    setCustomCustomerName("");
    setPaymentMethod("cash");
    
    // Close dialog
    if (onClose) onClose();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">نقطة البيع (POS)</h2>
          <p className="text-muted-foreground">إنشاء فاتورة جديدة</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Search and Filters */}
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "الكل" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-4xl">{product.image}</div>
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600">
                      {product.price.toLocaleString()} ر.س
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {product.stock} متوفر
                    </Badge>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 border-l bg-gray-50 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5" />
              <h3 className="font-semibold">سلة المشتريات</h3>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Customers Button */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCustomersClick}
                  disabled={customersLoading}
                  className="flex-1"
                >
                  <User className="h-4 w-4 ml-2" />
                  {customersLoading ? "جاري التحميل..." : "العملاء (F3)"}
                </Button>
                {customersData && customersData.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {customersData.length} عميل
                  </Badge>
                )}
              </div>

              {/* Customer Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">اختيار العميل:</label>
                {console.log('Customers data state:', { customersData, customersLoading, hasData: customersData && customersData.length > 0 })}
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عميل..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>عميل عادي</span>
                      </div>
                    </SelectItem>
                    {customersData && customersData.length > 0 ? (
                      customersData.map((customer) => {
                        console.log('Rendering customer:', customer);
                        return (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {customer.totalOrders} طلب - {customer.totalSpent.toLocaleString()} ر.س
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        اضغط على "العملاء (F3)" لتحميل قائمة العملاء
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Customer Name (only for walk-in customers) */}
              {selectedCustomerId === "walk-in" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">اسم العميل (اختياري):</label>
                  <Input
                    placeholder="أدخل اسم العميل..."
                    value={customCustomerName}
                    onChange={(e) => setCustomCustomerName(e.target.value)}
                  />
                </div>
              )}

              {/* Selected Customer Info */}
              {selectedCustomerId !== "walk-in" && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{getSelectedCustomerName()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>السلة فارغة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="text-2xl">{item.image}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.price.toLocaleString()} ر.س
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{tax.toLocaleString()} ر.س</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي:</span>
                  <span>{total.toLocaleString()} ر.س</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">طريقة الدفع:</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                    className="flex-1"
                  >
                    <Banknote className="h-4 w-4 ml-1" />
                    نقدي
                  </Button>
                  <Button
                    size="sm"
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("card")}
                    className="flex-1"
                  >
                    <CreditCard className="h-4 w-4 ml-1" />
                    بطاقة
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                <Calculator className="h-4 w-4 ml-2" />
                إتمام البيع
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
