import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, Users, Shield, UserCheck, UserX, AlertCircle, Loader2, Download, Upload, UserPlus, UserMinus, Clock } from "lucide-react";
import { userService, User, CreateUserDto, UpdateUserDto, UsersSummary } from "@/services/userService";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { useToast } from "@/hooks/use-toast";

// Remove the duplicate User interface and mockUsers array

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UsersSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.roleName === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });


  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [usersData, summaryData] = await Promise.all([
        userService.getAllUsers(),
        userService.getUsersSummary()
      ]);
      
      setUsers(usersData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تحميل البيانات');
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (roleName: string | undefined) => {
    const role = roleName?.toLowerCase() || '';
    return role === 'admin' 
      ? { label: "مدير النظام", variant: "default" as const, icon: Shield }
      : { label: "موظف نقاط البيع", variant: "secondary" as const, icon: Users };
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? { label: "نشط", variant: "default" as const, icon: UserCheck }
      : { label: "غير نشط", variant: "destructive" as const, icon: UserX };
  };

  const getUserInitials = (fullName?: string, username?: string) => {
    const name = fullName || username || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };


  // Event handlers
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormError(null);
    setIsFormDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormError(null);
    setIsFormDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveUser = async (userData: CreateUserDto | UpdateUserDto) => {
    try {
      setIsFormLoading(true);
      setFormError(null);

      if (selectedUser) {
        // Update existing user
        await userService.updateUser(selectedUser.id, userData as UpdateUserDto);
        toast({
          title: "نجح",
          description: "تم تحديث المستخدم بنجاح",
        });
      } else {
        // Create new user
        await userService.createUser(userData as CreateUserDto);
        toast({
          title: "نجح",
          description: "تم إضافة المستخدم بنجاح",
        });
      }

      setIsFormDialogOpen(false);
      loadData(); // Reload data
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ في حفظ المستخدم');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleteLoading(true);
      await userService.deleteUser(selectedUser.id);
      
      toast({
        title: "نجح",
        description: "تم حذف المستخدم بنجاح",
      });
      
      setIsDeleteDialogOpen(false);
      loadData(); // Reload data
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || 'حدث خطأ في حذف المستخدم',
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await userService.deactivateUser(user.id);
        toast({
          title: "نجح",
          description: "تم إلغاء تفعيل المستخدم",
        });
      } else {
        await userService.activateUser(user.id);
        toast({
          title: "نجح",
          description: "تم تفعيل المستخدم",
        });
      }
      loadData(); // Reload data
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || 'حدث خطأ في تغيير حالة المستخدم',
        variant: "destructive",
      });
    }
  };

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
        <Button 
          className="flex items-center gap-2 hover:shadow-md transition-shadow" 
          dir="rtl"
          onClick={handleAddUser}
        >
          <Plus className="h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        dir="rtl"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المستخدمين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (summary?.totalUsers || users.length)}
            </CardDescription>
          </CardHeader>
        </Card>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              المستخدمين النشطين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (summary?.activeUsers || users.filter(user => user.isActive).length)}
            </CardDescription>
          </CardHeader>
        </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              المديرين
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (summary?.roleDistribution.find(r => r.roleName.toLowerCase() === 'admin')?.userCount || users.filter(user => user.roleName.toLowerCase() === 'admin').length)}
            </CardDescription>
          </CardHeader>
        </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              موظفي نقاط البيع
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (summary?.roleDistribution.find(r => r.roleName.toLowerCase() === 'pos')?.userCount || users.filter(user => user.roleName.toLowerCase() === 'pos').length)}
            </CardDescription>
          </CardHeader>
        </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم، البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="الصلاحية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصلاحيات</SelectItem>
                <SelectItem value="Admin">مدير</SelectItem>
                <SelectItem value="POS">موظف نقاط البيع</SelectItem>
                <SelectItem value="Employee">موظف</SelectItem>
              </SelectContent>
            </Select>
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
          </div>
        </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right flex items-center gap-2 justify-end">
              <Users className="h-5 w-5" />
              قائمة المستخدمين ({filteredUsers.length}) - عرض 6 مستخدمين مع تمرير لأسفل
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
              <Button 
                variant="outline" 
                size="icon" 
                title="تحديث" 
                className="hover:bg-accent"
                onClick={loadData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-hidden">
            {/* Fixed Header - رأس الجدول ثابت */}
            <div className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-10">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[30%] text-center">المستخدم</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[15%] text-center">رقم الهاتف</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[12%] text-center">الصلاحية</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[10%] text-center">الحالة</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[15%] text-center">آخر تسجيل دخول</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[12%] text-center">تاريخ الإنشاء</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[6%] text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            
            {/* Scrollable Body - عرض 6 مستخدمين فقط مع تمرير لأسفل */}
            <div className="max-h-[360px] overflow-y-auto">
              <Table className="table-fixed w-full">
                <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">جاري تحميل المستخدمين...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'لا توجد مستخدمين مطابقين للبحث' : 'لا توجد مستخدمين'}
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      whileHover={{
                        backgroundColor: "rgba(var(--muted), 0.1)",
                        transition: { duration: 0.2 }
                      }}
                    >
                    <TableCell className="w-[30%] text-center py-4">
                      <div className="flex items-center gap-3 justify-center w-full" dir="rtl">
                        <div className="text-center flex-1 min-w-0">
                          <div className="font-medium text-blue-600 truncate w-full" title={user.fullName || user.username}>
                            {user.fullName || user.username}
                          </div>
                          <div className="text-sm text-muted-foreground truncate w-full" title={user.email}>
                            {user.email}
                          </div>
                        </div>
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {getUserInitials(user.fullName, user.username)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                    <TableCell className="w-[15%] text-center py-4 text-blue-600">
                      <div className="truncate max-w-[120px]" title={user.phoneNumber || 'غير محدد'}>
                        {user.phoneNumber || 'غير محدد'}
                      </div>
                    </TableCell>
                    <TableCell className="w-[12%] text-center py-4">
                      <Badge variant={getRoleBadge(user.roleName).variant} className="flex items-center gap-1 justify-center w-fit font-medium mx-auto">
                        {React.createElement(getRoleBadge(user.roleName).icon, { className: "h-3 w-3" })}
                        {getRoleBadge(user.roleName).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[10%] text-center py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                        className="p-0 h-auto"
                      >
                        <Badge variant={getStatusBadge(user.isActive).variant} className="flex items-center gap-1 justify-center w-fit font-medium mx-auto">
                          {React.createElement(getStatusBadge(user.isActive).icon, { className: "h-3 w-3" })}
                          {getStatusBadge(user.isActive).label}
                        </Badge>
                      </Button>
                    </TableCell>
                    <TableCell className="w-[15%] text-center py-4 text-muted-foreground">
                      <div className="truncate max-w-[120px]" title={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ar-SA') : 'لم يسجل دخول'}>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ar-SA') : 'لم يسجل دخول'}
                      </div>
                    </TableCell>
                    <TableCell className="w-[12%] text-center py-4 text-muted-foreground">
                      <div className="truncate max-w-[100px]" title={new Date(user.createdAt).toLocaleDateString('ar-SA')}>
                        {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </TableCell>
                    <TableCell className="w-[6%] text-center py-4">
                      <div className="flex items-center gap-2 justify-center" dir="rtl">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-accent" 
                          title="عرض التفاصيل"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-accent" 
                          title="تعديل"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                          title="حذف"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        </Card>
      </motion.div>


      {/* Dialogs */}
      <UserFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        isLoading={isFormLoading}
        error={formError}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isLoading={isDeleteLoading}
      />

      <UserDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}