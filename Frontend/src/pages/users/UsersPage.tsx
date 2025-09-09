import { useState } from "react";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, Users, Shield, UserCheck, UserX } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'pos';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    fullName: "أحمد محمد السالم",
    email: "ahmed.salem@store.com",
    phone: "966501234567",
    role: 'admin',
    status: 'active',
    lastLogin: "2024-01-15 14:30",
    createdAt: "2023-12-01"
  },
  {
    id: "2",
    fullName: "فاطمة علي أحمد",
    email: "fatma.ali@store.com",
    phone: "966507654321",
    role: 'pos',
    status: 'active',
    lastLogin: "2024-01-15 09:15",
    createdAt: "2024-01-02"
  },
  {
    id: "3",
    fullName: "محمد عبدالله الزهراني",
    email: "mohammed.zahrani@store.com",
    phone: "966551234567",
    role: 'pos',
    status: 'inactive',
    lastLogin: "2024-01-10 16:45",
    createdAt: "2023-11-15"
  }
];

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? { label: "مدير النظام", variant: "default" as const, icon: Shield }
      : { label: "موظف نقاط البيع", variant: "secondary" as const, icon: Users };
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? { label: "نشط", variant: "default" as const, icon: UserCheck }
      : { label: "غير نشط", variant: "destructive" as const, icon: UserX };
  };

  const getUserInitials = (fullName: string) => {
    return fullName.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  const filteredUsers = mockUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-2">
            إدارة المستخدمين وصلاحياتهم في النظام
          </p>
        </div>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Plus className="h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المستخدمين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockUsers.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              المستخدمين النشطين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockUsers.filter(user => user.status === 'active').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              المديرين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockUsers.filter(user => user.role === 'admin').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              موظفي نقاط البيع
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockUsers.filter(user => user.role === 'pos').length}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right flex items-center gap-2 justify-end">
              <Users className="h-5 w-5" />
              جميع المستخدمين
            </CardTitle>
            <div className="flex items-center gap-4" dir="rtl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في المستخدمين..."
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
                <TableHead className="text-right font-semibold">آخر تسجيل دخول</TableHead>
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">الصلاحية</TableHead>
                <TableHead className="text-right font-semibold">رقم الهاتف</TableHead>
                <TableHead className="text-right font-semibold">البريد الإلكتروني</TableHead>
                <TableHead className="text-right font-semibold">المستخدم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد مستخدمين مطابقين للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
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
                    <TableCell className="text-right text-muted-foreground">{user.createdAt}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusBadge(user.status).variant} className="flex items-center gap-1 justify-center w-fit font-medium">
                        {React.createElement(getStatusBadge(user.status).icon, { className: "h-3 w-3" })}
                        {getStatusBadge(user.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getRoleBadge(user.role).variant} className="flex items-center gap-1 justify-center w-fit font-medium">
                        {React.createElement(getRoleBadge(user.role).icon, { className: "h-3 w-3" })}
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-blue-600">{user.phone}</TableCell>
                    <TableCell className="text-right text-blue-600">{user.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-3 justify-end" dir="rtl">
                        <div className="text-right">
                          <div className="font-medium text-blue-600">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {getUserInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
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