import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Info,
  Server,
  Wifi
} from 'lucide-react';

interface PredictionData {
  predictedSales: number;
  confidence: number;
  date: string;
  model: string;
  features: {
    dayOfWeek: string;
    month: string;
    year: number;
    lastWeekAvg: number;
    lastMonthAvg: number;
    yesterdaySales?: number;
    expectedInvoices?: number;
    expectedQuantity?: number;
  };
  recommendations: string[];
  metadata?: {
    lastAvailableDate: string;
    featuresCount: number;
    modelType: string;
    modelAccuracy: string;
    message: string;
  };
}

const PredictionsPage: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<boolean | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    setIsDemoMode(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'}/api/predictions/tomorrow`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // فحص نوع الاستجابة
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // الباك اند غير متاح - عرض بيانات تجريبية
        console.warn('الباك اند غير متاح - عرض بيانات تجريبية');
        setIsDemoMode(true);
        showDemoData();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP_${response.status}: ${errorData.error || 'خطأ غير معروف'}`);
      }

      const data = await response.json();
      
      // تحويل البيانات من API إلى تنسيق الصفحة
      const predictionData: PredictionData = {
        predictedSales: data.predictedSales,
        confidence: data.confidence,
        date: new Date(data.predictionDate).toLocaleDateString('en-US'),
        model: data.modelName,
        features: {
          dayOfWeek: data.features.dayOfWeek,
          month: data.features.month,
          year: data.features.year,
          lastWeekAvg: data.features.lastWeekAverage,
          lastMonthAvg: data.features.lastMonthAverage,
          yesterdaySales: data.features.yesterdaySales,
          expectedInvoices: data.features.expectedInvoices,
          expectedQuantity: data.features.expectedQuantity
        },
        recommendations: data.recommendations,
        metadata: data.metadata ? {
          lastAvailableDate: new Date(data.metadata.lastAvailableDate).toLocaleDateString('en-US'),
          featuresCount: data.metadata.featuresCount,
          modelType: data.metadata.modelType,
          modelAccuracy: data.metadata.modelAccuracy,
          message: data.metadata.message
        } : undefined
      };
      
      setPrediction(predictionData);
      setServiceStatus(true);
      setIsDemoMode(false);
    } catch (err: any) {
      console.error('خطأ في جلب التنبؤات:', err);
      
      // عرض بيانات تجريبية
      setIsDemoMode(true);
      showDemoData();
      
      if (err.message === 'BACKEND_NOT_AVAILABLE') {
        setError('الباك اند غير متاح - عرض بيانات تجريبية');
      } else if (err.message.startsWith('HTTP_')) {
        setError(`خطأ في الخادم (${err.message}) - عرض بيانات تجريبية`);
      } else {
        setError('خطأ في الاتصال - عرض بيانات تجريبية');
      }
    } finally {
      setLoading(false);
    }
  };

  const showDemoData = () => {
    const mockPrediction: PredictionData = {
      predictedSales: 15420.50,
      confidence: 0.95,
      date: new Date().toLocaleDateString('en-US'),
      model: 'Random Forest (Demo Mode)',
      features: {
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        month: new Date().toLocaleDateString('en-US', { month: 'long' }),
        year: new Date().getFullYear(),
        lastWeekAvg: 12850.30,
        lastMonthAvg: 14200.75,
        yesterdaySales: 12300.00,
        expectedInvoices: 25,
        expectedQuantity: 150
      },
      recommendations: [
        'تأكد من تشغيل الباك اند على المنفذ 7001',
        'تأكد من تشغيل خدمة Python ML على المنفذ 5000',
        'تحقق من الاتصال بالإنترنت',
        'هذه بيانات تجريبية للعرض فقط'
      ],
      metadata: {
        lastAvailableDate: '2024-03-31',
        featuresCount: 45,
        modelType: 'Random Forest',
        modelAccuracy: '95%',
        message: 'عرض بيانات تجريبية - الباك اند غير متاح'
      }
    };
    
    setPrediction(mockPrediction);
    setServiceStatus(false);
  };

  const checkServiceStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'}/api/predictions/status`);
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.isAvailable);
      } else {
        setServiceStatus(false);
      }
    } catch (err) {
      setServiceStatus(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
    checkServiceStatus();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.8) return 'warning';
    return 'destructive';
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-3 rounded-xl text-white shadow-lg ${
              isDemoMode 
                ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}
          >
            <Brain className="h-8 w-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              تنبؤات المبيعات
              {isDemoMode && (
                <Badge variant="outline" className="mr-2 bg-orange-100 text-orange-700">
                  وضع تجريبي
                </Badge>
              )}
            </h1>
            <p className="text-gray-600">
              {isDemoMode 
                ? 'عرض بيانات تجريبية - الباك اند غير متاح'
                : 'التنبؤ الذكي لمبيعات الغد باستخدام الذكاء الاصطناعي'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Service Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${serviceStatus ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {serviceStatus ? 'الخدمة متاحة' : 'الخدمة غير متاحة'}
            </span>
          </div>
          
          <Button
            onClick={fetchPrediction}
            disabled={loading}
            className={`shadow-lg ${
              isDemoMode
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } text-white`}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isDemoMode ? 'محاولة الاتصال' : 'تحديث التنبؤ'}
          </Button>
        </div>
      </motion.div>

      {/* Service Status Alert */}
      {!serviceStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">الخدمة غير متاحة</p>
              <p className="text-red-700 text-sm">
                تأكد من تشغيل الباك اند على المنفذ 7001 وخدمة Python ML على المنفذ 5000
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Demo Mode Alert */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Wifi className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-orange-800 font-medium">وضع تجريبي</p>
              <p className="text-orange-700 text-sm">
                يتم عرض بيانات تجريبية. لتشغيل النظام الحقيقي، تأكد من تشغيل جميع الخوادم.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">ملاحظة مهمة</p>
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Prediction Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className={`border-2 shadow-xl ${
          isDemoMode 
            ? 'bg-gradient-to-br from-white to-orange-50 border-orange-200' 
            : 'bg-gradient-to-br from-white to-blue-50 border-blue-200'
        }`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`text-2xl font-bold flex items-center justify-center gap-3 ${
              isDemoMode ? 'text-orange-900' : 'text-gray-900'
            }`}>
              <Target className={`h-8 w-8 ${isDemoMode ? 'text-orange-600' : 'text-blue-600'}`} />
              تنبؤ مبيعات الغد
              {isDemoMode && (
                <Badge variant="outline" className="bg-orange-100 text-orange-700">
                  تجريبي
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className={`mx-auto w-16 h-16 border-4 rounded-full mb-4 ${
                    isDemoMode 
                      ? 'border-orange-200 border-t-orange-600' 
                      : 'border-blue-200 border-t-blue-600'
                  }`}
                />
                <p className="text-gray-600">جاري تحليل البيانات والتنبؤ...</p>
              </div>
            ) : prediction ? (
              <>
                {/* Prediction Value */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`text-6xl font-bold mb-2 ${
                      isDemoMode ? 'text-orange-600' : 'text-blue-600'
                    }`}
                  >
                    {prediction.predictedSales.toLocaleString()}
                  </motion.div>
                  <p className="text-2xl text-gray-600 mb-4">ريال سعودي</p>
                  
                  {/* Confidence */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Badge 
                      variant={getConfidenceBadge(prediction.confidence)}
                      className="text-lg px-4 py-2"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      دقة التنبؤ: {(prediction.confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={prediction.confidence * 100} 
                    className="w-full max-w-md mx-auto h-3"
                  />
                </div>

                <Separator />

                {/* Model Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        معلومات النموذج
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">النموذج المستخدم:</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700">
                          {prediction.model}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ التنبؤ:</span>
                        <span className="font-medium">{prediction.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">يوم الأسبوع:</span>
                        <span className="font-medium">{prediction.features.dayOfWeek}</span>
                      </div>
                      {prediction.metadata && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">عدد الميزات:</span>
                            <span className="font-medium">{prediction.metadata.featuresCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">دقة النموذج:</span>
                            <span className="font-medium text-green-600">{prediction.metadata.modelAccuracy}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        البيانات المرجعية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">متوسط الأسبوع الماضي:</span>
                        <span className="font-medium text-green-600">
                          {prediction.features.lastWeekAvg.toLocaleString()} ريال
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">متوسط الشهر الماضي:</span>
                        <span className="font-medium text-green-600">
                          {prediction.features.lastMonthAvg.toLocaleString()} ريال
                        </span>
                      </div>
                      {prediction.features.yesterdaySales && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">مبيعات الأمس:</span>
                          <span className="font-medium text-blue-600">
                            {prediction.features.yesterdaySales.toLocaleString()} ريال
                          </span>
                        </div>
                      )}
                      {prediction.features.expectedInvoices && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">الفواتير المتوقعة:</span>
                          <span className="font-medium text-orange-600">
                            {prediction.features.expectedInvoices} فاتورة
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Model Metadata */}
                {prediction.metadata && (
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                        <Info className="h-5 w-5" />
                        معلومات تقنية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">آخر تاريخ متاح:</span>
                          <span className="text-blue-600 mr-2">{prediction.metadata.lastAvailableDate}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">نوع النموذج:</span>
                          <span className="text-blue-600 mr-2">{prediction.metadata.modelType}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">عدد الميزات:</span>
                          <span className="text-blue-600 mr-2">{prediction.metadata.featuresCount}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">دقة النموذج:</span>
                          <span className="text-blue-600 mr-2">{prediction.metadata.modelAccuracy}</span>
                        </div>
                      </div>
                      {prediction.metadata.message && (
                        <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800 text-sm">
                          {prediction.metadata.message}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                      <Zap className="h-5 w-5" />
                      التوصيات الذكية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-start gap-3 text-orange-700"
                        >
                          <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">دقة عالية</h3>
            <p className="text-green-700 text-sm">نموذج متقدم بدقة تصل إلى 95%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">تحديث فوري</h3>
            <p className="text-blue-700 text-sm">تنبؤات محدثة يومياً</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">ذكاء اصطناعي</h3>
            <p className="text-purple-700 text-sm">تحليل متقدم للأنماط</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PredictionsPage;