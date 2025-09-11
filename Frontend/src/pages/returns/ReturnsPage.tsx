import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ReturnsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">المرتجعات</h1>
            <p className="text-gray-600">إدارة مرتجعات المبيعات والمشتريات</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">
            ميزة المرتجعات قريباً
          </CardTitle>
          <CardDescription className="text-lg text-blue-700 max-w-2xl mx-auto">
            نحن نعمل على تطوير نظام شامل لإدارة المرتجعات. ستتمكن قريباً من:
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">إرجاع منتجات المبيعات</h3>
                  <p className="text-sm text-gray-600">إرجاع منتجات من فواتير المبيعات وإعادتها للمخزون</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">إرجاع مشتريات</h3>
                  <p className="text-sm text-gray-600">إرجاع منتجات للموردين وإدارة فواتير الإرجاع</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">تتبع المرتجعات</h3>
                  <p className="text-sm text-gray-600">متابعة حالة المرتجعات وتاريخها</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">تقارير المرتجعات</h3>
                  <p className="text-sm text-gray-600">تقارير مفصلة عن المرتجعات والإحصائيات</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">تقدم التطوير</span>
              <span className="text-sm font-medium text-gray-700">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate('/sales/invoices')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              عرض فواتير المبيعات
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/inventory/products')}
            >
              إدارة المنتجات
            </Button>
          </div>

          {/* Contact Info */}
          <div className="text-center pt-6 border-t border-blue-200">
            <p className="text-sm text-gray-600">
              هل لديك استفسارات حول ميزة المرتجعات؟ 
              <span className="text-blue-600 font-medium"> تواصل معنا</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}