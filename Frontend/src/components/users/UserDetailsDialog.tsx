import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Users, UserCheck, UserX, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { User as UserType } from '@/services/userService';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export function UserDetailsDialog({ isOpen, onClose, user }: UserDetailsDialogProps) {
  if (!user) return null;

  const getRoleBadge = (roleName: string) => {
    return roleName.toLowerCase() === 'admin' 
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const roleBadge = getRoleBadge(user.roleName);
  const statusBadge = getStatusBadge(user.isActive);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تفاصيل المستخدم</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-4" dir="rtl">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                {getUserInitials(user.fullName, user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-right">
              <h2 className="text-2xl font-bold text-foreground">
                {user.fullName || user.username}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={roleBadge.variant} className="flex items-center gap-1">
                  {React.createElement(roleBadge.icon, { className: "h-3 w-3" })}
                  {roleBadge.label}
                </Badge>
                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                  {React.createElement(statusBadge.icon, { className: "h-3 w-3" })}
                  {statusBadge.label}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <User className="h-5 w-5" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                {user.phoneNumber && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      رقم الهاتف
                    </div>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    اسم المستخدم
                  </div>
                  <p className="font-medium">{user.username}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    الدور
                  </div>
                  <p className="font-medium">{roleBadge.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    تاريخ الإنشاء
                  </div>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>

                {user.lastLoginAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      آخر تسجيل دخول
                    </div>
                    <p className="font-medium">{formatDate(user.lastLoginAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          {user.permissions && user.permissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  الأذونات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
