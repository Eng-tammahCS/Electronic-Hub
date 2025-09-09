import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Store, Bell, Shield, Palette, Database, Save, RefreshCw } from "lucide-react";

export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    lowStock: true,
    salesReports: true
  });

  const [storeSettings, setStoreSettings] = useState({
    name: "متجر الإلكترونيات الذكي",
    address: "الرياض، المملكة العربية السعودية",
    phone: "966501234567",
    email: "info@smart-electronics.com",
    currency: "SAR",
    language: "ar",
    timezone: "Asia/Riyadh"
  });

  return (
    <div className="space-y-6 animate-fade-in rtl-layout" dir="rtl">
      {/* Header */}
      <div className="text-right" dir="rtl">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 justify-end" dir="rtl">
          الإعدادات العامة
          <Settings className="h-8 w-8" />
        </h1>
        <p className="text-muted-foreground mt-2">
          إدارة إعدادات النظام والتفضيلات العامة
        </p>
      </div>

      <Tabs defaultValue="store" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-5" dir="rtl">
          <TabsTrigger value="store" className="flex items-center gap-2 hover:bg-accent transition-colors" dir="rtl">
            <Store className="h-4 w-4" />
            المتجر
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 hover:bg-accent transition-colors" dir="rtl">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 hover:bg-accent transition-colors" dir="rtl">
            <Shield className="h-4 w-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 hover:bg-accent transition-colors" dir="rtl">
            <Palette className="h-4 w-4" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2 hover:bg-accent transition-colors" dir="rtl">
            <Database className="h-4 w-4" />
            النظام
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-right">معلومات المتجر</CardTitle>
              <CardDescription className="text-right">
                إعدادات المعلومات الأساسية للمتجر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                <div className="space-y-2 text-right">
                  <Label htmlFor="storeName">اسم المتجر</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                    className="text-right hover:border-primary focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="storeEmail">البريد الإلكتروني</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                    className="text-right hover:border-primary focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                <div className="space-y-2 text-right">
                  <Label htmlFor="storePhone">رقم الهاتف</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                    className="text-right hover:border-primary focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2 text-right" dir="rtl">
                  <Label htmlFor="currency">العملة</Label>
                  <Select value={storeSettings.currency} onValueChange={(value) => setStoreSettings({...storeSettings, currency: value})}>
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="SAR" dir="rtl">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD" dir="rtl">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR" dir="rtl">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="storeAddress">عنوان المتجر</Label>
                <Input
                  id="storeAddress"
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  className="text-right hover:border-primary focus:border-primary transition-colors"
                />
              </div>

              <div className="flex justify-end gap-4" dir="rtl">
                <Button variant="outline" className="hover:shadow-md transition-shadow hover:bg-accent" dir="rtl">إلغاء</Button>
                <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-right">إعدادات الإشعارات</CardTitle>
              <CardDescription className="text-right">
                إدارة تفضيلات الإشعارات والتنبيهات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between" dir="rtl">
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                  <div className="text-right">
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">استقبال الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between" dir="rtl">
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                  <div className="text-right">
                    <Label>إشعارات الرسائل النصية</Label>
                    <p className="text-sm text-muted-foreground">استقبال الإشعارات عبر الرسائل النصية</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between" dir="rtl">
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                  />
                  <div className="text-right">
                    <Label>تنبيهات المخزون المنخفض</Label>
                    <p className="text-sm text-muted-foreground">إشعارات عندما يصل المنتج للحد الأدنى</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between" dir="rtl">
                  <Switch
                    checked={notifications.salesReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, salesReports: checked})}
                  />
                  <div className="text-right">
                    <Label>تقارير المبيعات اليومية</Label>
                    <p className="text-sm text-muted-foreground">تلقي ملخص يومي لأداء المبيعات</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4" dir="rtl">
                <Button variant="outline" className="hover:shadow-md transition-shadow hover:bg-accent" dir="rtl">إعادة تعيين</Button>
                <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-right">إعدادات الأمان</CardTitle>
              <CardDescription className="text-right">
                إدارة إعدادات الأمان وكلمات المرور
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                  <Input id="currentPassword" type="password" className="text-right hover:border-primary focus:border-primary transition-colors" />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <Input id="newPassword" type="password" className="text-right hover:border-primary focus:border-primary transition-colors" />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                  <Input id="confirmPassword" type="password" className="text-right hover:border-primary focus:border-primary transition-colors" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between" dir="rtl">
                    <Switch />
                    <div className="text-right">
                      <Label>المصادقة الثنائية</Label>
                      <p className="text-sm text-muted-foreground">تفعيل المصادقة الثنائية لمزيد من الأمان</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between" dir="rtl">
                    <Switch />
                    <div className="text-right">
                      <Label>تسجيل الخروج التلقائي</Label>
                      <p className="text-sm text-muted-foreground">تسجيل خروج تلقائي بعد فترة عدم نشاط</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4" dir="rtl">
                <Button variant="outline" className="hover:shadow-md transition-shadow hover:bg-accent" dir="rtl">إلغاء</Button>
                <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
                  <Save className="h-4 w-4" />
                  تحديث كلمة المرور
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-right">إعدادات المظهر</CardTitle>
              <CardDescription className="text-right">
                تخصيص مظهر النظام والواجهة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                <div className="space-y-2 text-right" dir="rtl">
                  <Label>المظهر</Label>
                  <Select defaultValue="system">
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="light" dir="rtl">فاتح</SelectItem>
                      <SelectItem value="dark" dir="rtl">داكن</SelectItem>
                      <SelectItem value="system" dir="rtl">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-right" dir="rtl">
                  <Label>اللغة</Label>
                  <Select defaultValue="ar">
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="ar" dir="rtl">العربية</SelectItem>
                      <SelectItem value="en" dir="rtl">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between" dir="rtl">
                  <Switch defaultChecked />
                  <div className="text-right">
                    <Label>الحركات والانتقالات</Label>
                    <p className="text-sm text-muted-foreground">تفعيل الحركات المرئية في الواجهة</p>
                  </div>
                </div>

                <div className="flex items-center justify-between" dir="rtl">
                  <Switch defaultChecked />
                  <div className="text-right">
                    <Label>الأصوات</Label>
                    <p className="text-sm text-muted-foreground">تشغيل الأصوات عند التفاعل</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4" dir="rtl">
                <Button variant="outline" className="hover:shadow-md transition-shadow hover:bg-accent" dir="rtl">إعادة تعيين</Button>
                <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
                  <Save className="h-4 w-4" />
                  حفظ التفضيلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-right">إعدادات النظام</CardTitle>
              <CardDescription className="text-right">
                إدارة الإعدادات التقنية للنظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                <div className="space-y-2 text-right" dir="rtl">
                  <Label>المنطقة الزمنية</Label>
                  <Select value={storeSettings.timezone} onValueChange={(value) => setStoreSettings({...storeSettings, timezone: value})}>
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="Asia/Riyadh" dir="rtl">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai" dir="rtl">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Europe/London" dir="rtl">لندن (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-right" dir="rtl">
                  <Label>تنسيق التاريخ</Label>
                  <Select defaultValue="dd/mm/yyyy">
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="dd/mm/yyyy" dir="rtl">يوم/شهر/سنة</SelectItem>
                      <SelectItem value="mm/dd/yyyy" dir="rtl">شهر/يوم/سنة</SelectItem>
                      <SelectItem value="yyyy-mm-dd" dir="rtl">سنة-شهر-يوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-right">صيانة النظام</h3>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" dir="rtl">
                  <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow" title="مسح الذاكرة المؤقتة" dir="rtl">
                    <RefreshCw className="h-4 w-4" />
                    مسح الذاكرة المؤقتة
                  </Button>
                  <div className="text-right">
                    <Label>مسح الذاكرة المؤقتة</Label>
                    <p className="text-sm text-muted-foreground">حذف البيانات المؤقتة لتحسين الأداء</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" dir="rtl">
                  <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow" title="إنشاء نسخة احتياطية" dir="rtl">
                    <Database className="h-4 w-4" />
                    نسخ احتياطي
                  </Button>
                  <div className="text-right">
                    <Label>إنشاء نسخة احتياطية</Label>
                    <p className="text-sm text-muted-foreground">إنشاء نسخة احتياطية من بيانات النظام</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4" dir="rtl">
                <Button variant="outline" className="hover:shadow-md transition-shadow hover:bg-accent" dir="rtl">إلغاء</Button>
                <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}