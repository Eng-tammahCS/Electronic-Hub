import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { User, CreateUserDto, UpdateUserDto } from '@/services/userService';

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserDto | UpdateUserDto) => Promise<void>;
  user?: User | null;
  isLoading?: boolean;
  error?: string | null;
}

const roles = [
  { id: 1, name: 'admin', label: 'مدير النظام' },
  { id: 2, name: 'pos', label: 'موظف نقاط البيع' }
];

export function UserFormDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  user, 
  isLoading = false, 
  error 
}: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    roleId: 1,
    isActive: true,
    image: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        roleId: user.roleId,
        isActive: user.isActive,
        image: user.image || ''
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        roleId: 1,
        isActive: true,
        image: ''
      });
    }
    setValidationErrors({});
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    } else if (formData.username.length < 3) {
      errors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      // التحقق من وجود أحرف عربية
      if (/[\u0600-\u06FF]/.test(formData.username)) {
        errors.username = 'اسم المستخدم يجب أن يكون بالإنجليزية فقط (لا يُسمح بالأحرف العربية)';
      } else {
        errors.username = 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام و _ فقط (لا يُسمح بالرموز الخاصة أو المسافات)';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!isEditMode && !formData.password.trim()) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (!isEditMode && formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (formData.phoneNumber && !/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'رقم الهاتف غير صحيح';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        const updateData: UpdateUserDto = {
          email: formData.email,
          fullName: formData.fullName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          roleId: formData.roleId,
          isActive: formData.isActive,
          image: formData.image || undefined
        };
        await onSave(updateData);
      } else {
        const createData: CreateUserDto = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          roleId: formData.roleId,
          isActive: formData.isActive,
          image: formData.image || undefined
        };
        await onSave(createData);
      }
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for username
    if (field === 'username' && typeof value === 'string') {
      if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
        // التحقق من وجود أحرف عربية
        if (/[\u0600-\u06FF]/.test(value)) {
          setValidationErrors(prev => ({ 
            ...prev, 
            username: 'اسم المستخدم يجب أن يكون بالإنجليزية فقط (لا يُسمح بالأحرف العربية)' 
          }));
        } else {
          setValidationErrors(prev => ({ 
            ...prev, 
            username: 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام و _ فقط' 
          }));
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username - Only for new users */}
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className={validationErrors.username ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  مسموح: أحرف إنجليزية فقط، أرقام، و _ (لا يُسمح بالأحرف العربية)
                </p>
                {validationErrors.username && (
                  <p className="text-sm text-destructive">{validationErrors.username}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="أدخل البريد الإلكتروني"
                className={validationErrors.email ? 'border-destructive' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>

            {/* Password - Only for new users */}
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className={validationErrors.password ? 'border-destructive' : ''}
                />
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="أدخل الاسم الكامل"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">رقم الهاتف</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="أدخل رقم الهاتف"
                className={validationErrors.phoneNumber ? 'border-destructive' : ''}
              />
              {validationErrors.phoneNumber && (
                <p className="text-sm text-destructive">{validationErrors.phoneNumber}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">الدور *</Label>
              <Select value={formData.roleId.toString()} onValueChange={(value) => handleInputChange('roleId', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">رابط الصورة</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="أدخل رابط الصورة (اختياري)"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">المستخدم نشط</Label>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'حفظ التغييرات' : 'إضافة المستخدم'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
