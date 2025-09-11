import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  RefreshCw, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Loader2, 
  AlertCircle,
  Save,
  X,
  Eye,
  Package
} from "lucide-react";
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { Category, CreateCategoryRequest } from "@/services/categoryService";
import LoadingSpinner from "@/components/LoadingSpinner";

export function CategoriesPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // Form states
  const [newCategory, setNewCategory] = useState<CreateCategoryRequest>({
    name: ""
  });
  const [editCategory, setEditCategory] = useState<CreateCategoryRequest>({
    name: ""
  });

  // API hooks
  const { 
    data: categoriesResponse, 
    isLoading: isLoadingCategories, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategories();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Extract categories from response
  const categories = categoriesResponse?.data || [];
  const isLoading = isLoadingCategories || createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending;

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive"
      });
      return;
    }

    try {
      await createCategoryMutation.mutateAsync(newCategory);
      setNewCategory({ name: "" });
      setIsAddDialogOpen(false);
      
      toast({
        title: "تم إضافة الفئة",
        description: `تم إضافة "${newCategory.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في إضافة الفئة",
        description: "حدث خطأ أثناء إضافة الفئة",
        variant: "destructive"
      });
    }
  };

  // Edit category
  const handleEditCategory = async () => {
    if (!editCategory.name.trim() || !selectedCategory) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: selectedCategory.id,
        data: editCategory
      });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      
      toast({
        title: "تم تحديث الفئة",
        description: `تم تحديث "${editCategory.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث الفئة",
        description: "حدث خطأ أثناء تحديث الفئة",
        variant: "destructive"
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditCategory({
      name: category.name
    });
    setIsEditDialogOpen(true);
  };

  // Reset edit form
  const resetEditForm = () => {
    setEditCategory({
      name: selectedCategory?.name || ""
    });
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast({
        title: "تم حذف الفئة",
        description: `تم حذف "${categoryToDelete.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في حذف الفئة",
        description: "حدث خطأ أثناء حذف الفئة",
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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        dir="rtl"
      >
        <motion.div
          className="text-right"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold gradient-text">إدارة الفئات</h1>
          <p className="text-muted-foreground mt-2">
            تنظيم وإدارة فئات المنتجات في المتجر
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Plus className="h-4 w-4" />
          إضافة فئة جديدة
        </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة فئة جديدة</DialogTitle>
                <DialogDescription>
                  أدخل اسم الفئة الجديدة
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">اسم الفئة *</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="اسم الفئة"
                  />
                </div>
      </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleAddCategory}
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة الفئة'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </motion.div>

      {/* Error Alert */}
      {categoriesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطأ في تحميل الفئات: {categoriesError.message}
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => refetchCategories()}
            >
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        dir="rtl"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الفئات</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                فئات مسجلة في النظام
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الفئات المضافة اليوم</CardTitle>
              <Plus className="h-4 w-4 text-green-500" />
          </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {categories.filter(cat => {
                  const today = new Date().toDateString();
                  const categoryDate = new Date(cat.createdAt).toDateString();
                  return categoryDate === today;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                فئات جديدة اليوم
              </p>
            </CardContent>
        </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">آخر فئة مضافة</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {categories.length > 0 ? categories[categories.length - 1].name : 'لا توجد'}
              </div>
              <p className="text-xs text-muted-foreground">
                {categories.length > 0 ? new Date(categories[categories.length - 1].createdAt).toLocaleDateString('ar-SA') : ''}
              </p>
            </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      {/* Search and Refresh Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
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
                  placeholder="البحث في الفئات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => refetchCategories()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              قائمة الفئات ({filteredCategories.length})
            </CardTitle>
            <CardDescription>
              جميع فئات المنتجات مع إمكانية البحث والتصفية
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="جاري تحميل الفئات..." variant="gradient" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                {/* Fixed Header */}
                <div className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[20%]">الإجراءات</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[25%]">تاريخ الإنشاء</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[55%]">اسم الفئة</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
                
                {/* Scrollable Body */}
                <div className="max-h-[500px] overflow-y-auto">
                  <Table className="table-fixed w-full">
                    <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            {categories.length === 0 ? 'لا توجد فئات' : 'لا توجد فئات تطابق معايير البحث'}
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence>
                        {filteredCategories.map((category, index) => (
                          <motion.tr
                            key={category.id}
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
                            <TableCell className="w-[20%]">
                              <div className="flex items-center gap-1">
                                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedCategory(category)}
                                      title="عرض التفاصيل"
                                      className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>تفاصيل الفئة</DialogTitle>
                                      <DialogDescription>
                                        معلومات شاملة عن الفئة
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedCategory && (
                                      <div className="space-y-4">
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                          <h3 className="font-semibold text-lg">{selectedCategory.name}</h3>
                                          <p className="text-sm text-muted-foreground mt-2">
                                            تاريخ الإنشاء: {new Date(selectedCategory.createdAt).toLocaleDateString('ar-SA')}
                                          </p>
                                        </div>
                                        <div className="flex justify-center gap-3">
                                          <Button
                                            variant="outline"
                                            onClick={() => setIsViewDialogOpen(false)}
                                          >
                                            <X className="h-4 w-4 mr-2" />
                                            إغلاق
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              setIsViewDialogOpen(false);
                                              openEditDialog(selectedCategory);
                                            }}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <Edit className="h-4 w-4 mr-2" />
                                            تعديل الفئة
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openEditDialog(category)}
                                  title="تعديل الفئة"
                                  className="hover:bg-green-50 hover:text-green-600 transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(category)}
                                  disabled={deleteCategoryMutation.isPending}
                                  title="حذف الفئة"
                                  className="hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="w-[25%] text-muted-foreground">
                              {new Date(category.createdAt).toLocaleDateString('ar-SA')}
                            </TableCell>
                            <TableCell className="w-[55%] font-medium text-blue-600">
                              {category.name}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>


      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الفئة</DialogTitle>
            <DialogDescription>
              تعديل بيانات الفئة المحددة
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">اسم الفئة *</Label>
              <Input
                id="edit-name"
                value={editCategory.name}
                onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
                placeholder="اسم الفئة"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="outline" onClick={resetEditForm}>
              إعادة تعيين
            </Button>
            <Button 
              onClick={handleEditCategory}
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  تحديث الفئة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md rtl border-destructive/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300" dir="rtl">
          <AlertDialogHeader className="text-right pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full animate-pulse">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-bold text-destructive text-center">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3 mt-4">
              <div className="text-sm text-muted-foreground">
                هل أنت متأكد من أنك تريد حذف الفئة التالية؟
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="font-semibold text-foreground text-lg">
                  "{categoryToDelete?.name}"
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  تاريخ الإنشاء: {categoryToDelete ? new Date(categoryToDelete.createdAt).toLocaleDateString('ar-SA') : ''}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-destructive font-medium bg-destructive/5 p-3 rounded-md border border-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <span>تحذير: هذا الإجراء لا يمكن التراجع عنه!</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-3 pt-6 border-t bg-muted/20">
            <AlertDialogCancel
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 bg-background hover:bg-muted/80 text-foreground border shadow-sm transition-all duration-200"
              disabled={deleteCategoryMutation.isPending}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {deleteCategoryMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                  حذف الفئة
                      </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}