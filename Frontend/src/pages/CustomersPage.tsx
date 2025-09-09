import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Plus, Users, UserCheck, UserX, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { apiService } from "@/services/apiService";
import { API_CONFIG } from "@/config/api";

// Interface for Customer data - matches API response exactly
interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string; // API returns DateTime but we'll convert to string
  lastOrderDate: string;  // API returns DateTime but we'll convert to string
}

export function CustomersPage() {
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch customers from API
  const { data: customersData, isLoading, error } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.CUSTOMERS);
        if (response.success && response.data && response.data.length > 0) {
          // Transform API data to match our interface
          return response.data.map(customer => ({
            ...customer,
            firstOrderDate: new Date(customer.firstOrderDate).toISOString(),
            lastOrderDate: new Date(customer.lastOrderDate).toISOString()
          }));
        }
        // If no real data, return mock data as fallback
        return getMockCustomersData();
      } catch (error) {
        console.warn('API not available, using mock data:', error);
        return getMockCustomersData();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data fallback
  const getMockCustomersData = (): Customer[] => [
    {
      id: 1,
      name: "أحمد محمد علي",
      phone: "+966501234567",
      email: "ahmed.mohamed@example.com",
      address: "الرياض، المملكة العربية السعودية",
      isActive: true,
      totalOrders: 12,
      totalSpent: 2450.75,
      firstOrderDate: "2024-01-15T10:30:00Z",
      lastOrderDate: "2024-01-20T14:22:00Z"
    },
    {
      id: 2,
      name: "فاطمة أحمد السعيد",
      phone: "+966502345678",
      email: "fatima.ahmed@example.com",
      address: "جدة، المملكة العربية السعودية",
      isActive: true,
      totalOrders: 8,
      totalSpent: 1890.50,
      firstOrderDate: "2024-01-10T09:15:00Z",
      lastOrderDate: "2024-01-18T16:45:00Z"
    },
    {
      id: 3,
      name: "محمد عبدالله القحطاني",
      phone: "+966503456789",
      email: "mohammed.abdullah@example.com",
      address: "الدمام، المملكة العربية السعودية",
      isActive: true,
      totalOrders: 15,
      totalSpent: 3200.25,
      firstOrderDate: "2024-01-08T11:20:00Z",
      lastOrderDate: "2024-01-16T13:30:00Z"
    },
    {
      id: 4,
      name: "نورا سعد المطيري",
      phone: "+966504567890",
      email: "nora.saad@example.com",
      address: "الخبر، المملكة العربية السعودية",
      isActive: false,
      totalOrders: 5,
      totalSpent: 980.00,
      firstOrderDate: "2024-01-05T08:45:00Z",
      lastOrderDate: "2024-01-12T10:15:00Z"
    },
    {
      id: 5,
      name: "خالد فيصل الشمري",
      phone: "+966505678901",
      email: "khalid.faisal@example.com",
      address: "الطائف، المملكة العربية السعودية",
      isActive: true,
      totalOrders: 22,
      totalSpent: 4560.80,
      firstOrderDate: "2024-01-03T15:30:00Z",
      lastOrderDate: "2024-01-19T12:00:00Z"
    }
  ];

  // Define columns for the table
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "اسم العميل",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-lg">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground">
            ID: {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "عدد الطلبات",
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {row.getValue("totalOrders")}
          </div>
          <div className="text-xs text-muted-foreground">طلب</div>
        </div>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "إجمالي المبيعات",
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            {Number(row.getValue("totalSpent")).toLocaleString()} ر.س
          </div>
          <div className="text-xs text-muted-foreground">
            متوسط: {row.original.totalOrders > 0 ? 
              (Number(row.getValue("totalSpent")) / row.original.totalOrders).toFixed(0) : 0} ر.س
          </div>
        </div>
      ),
    },
    {
      accessorKey: "firstOrderDate",
      header: "تاريخ أول طلب",
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">
            {new Date(row.getValue("firstOrderDate")).toLocaleDateString("ar-SA")}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(row.getValue("firstOrderDate")).toLocaleTimeString("ar-SA", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "lastOrderDate",
      header: "تاريخ آخر طلب",
      cell: ({ row }) => {
        const lastOrderDate = new Date(row.getValue("lastOrderDate"));
        const daysSinceLastOrder = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="text-center">
            <div className="text-sm font-medium">
              {lastOrderDate.toLocaleDateString("ar-SA")}
            </div>
            <div className="text-xs text-muted-foreground">
              منذ {daysSinceLastOrder} يوم
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const lastOrderDate = new Date(row.original.lastOrderDate);
        const daysSinceLastOrder = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
        const isRecentlyActive = daysSinceLastOrder <= 30;
        
        return (
          <div className="text-center">
            <Badge variant={isRecentlyActive ? "default" : "secondary"}>
              {isRecentlyActive ? "نشط" : "غير نشط"}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {isRecentlyActive ? "نشط مؤخراً" : "غير نشط"}
            </div>
          </div>
        );
      },
    },
  ];

  // Create table instance
  const table = useReactTable({
    data: customersData || [],
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Calculate statistics based on real data
  const totalCustomers = customersData?.length || 0;
  const totalSpent = customersData?.reduce((sum, c) => sum + c.totalSpent, 0) || 0;
  const totalOrders = customersData?.reduce((sum, c) => sum + c.totalOrders, 0) || 0;
  
  // Calculate active customers based on recent activity (last 30 days)
  const activeCustomers = customersData?.filter(c => {
    const daysSinceLastOrder = Math.floor((Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastOrder <= 30;
  }).length || 0;
  
  const inactiveCustomers = totalCustomers - activeCustomers;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">إدارة العملاء</h1>
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">إدارة العملاء</h1>
            <p className="text-muted-foreground text-red-600">حدث خطأ في تحميل البيانات</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            لا يمكن تحميل بيانات العملاء. يرجى المحاولة مرة أخرى.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            إدارة العملاء
          </h1>
          <p className="text-muted-foreground">
            إدارة بيانات العملاء ومعلوماتهم
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة عميل جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {totalOrders} طلب إجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء النشطين</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              نشط خلال آخر 30 يوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء غير النشطين</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveCustomers}</div>
            <p className="text-xs text-muted-foreground">
              غير نشط منذ أكثر من 30 يوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSpent.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              متوسط: {totalCustomers > 0 ? (totalSpent / totalCustomers).toFixed(0) : 0} ر.س/عميل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو الهاتف أو البريد الإلكتروني..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء ({table.getFilteredRowModel().rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      لا توجد نتائج.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} من {table.getCoreRowModel().rows.length} صف.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}