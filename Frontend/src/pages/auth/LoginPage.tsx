import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  Lock,
  User,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginForm {
  username: string;
  password: string;
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user, login, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Redirect if already logged in
  if (user && !isLoading) {
    const defaultRoute = user.roleName === 'Admin' ? '/dashboard' : '/pos';
    return <Navigate to={defaultRoute} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setConnectionError(null);

    try {
      const result = await login(data.username, data.password);

      if (result.success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام إدارة متجر الإلكترونيات",
        });
      } else {
        // Check if it's a connection error
        if (result.message?.includes('fetch') || result.message?.includes('network')) {
          setConnectionError('تعذر الاتصال بالخادم. تأكد من تشغيل الباك اند.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setConnectionError('حدث خطأ غير متوقع. حاول مرة أخرى.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5 dark:from-slate-900 dark:via-primary/10 dark:to-secondary/10">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -120],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
        >
          {/* Header Section */}
          <motion.div
            className="text-center space-y-6 mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Logo with Glow Effect */}
            <motion.div
              className="flex justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-2xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Store className="h-10 w-10 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Title with Gradient Text */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                متجر الإلكترونيات الذكي
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                نظام إدارة متقدم للمتاجر الإلكترونية
              </motion.p>
            </motion.div>

            {/* Status Indicator */}
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div
                animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-secondary" />
                ) : (
                  <WifiOff className="h-5 w-5 text-destructive" />
                )}
              </motion.div>
              <span className={`text-sm font-medium ${isOnline ? 'text-secondary' : 'text-destructive'}`}>
                {isOnline ? 'متصل بالإنترنت' : 'غير متصل'}
              </span>
            </motion.div>
          </motion.div>

          {/* Connection Error Alert */}
          <AnimatePresence>
            {connectionError && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {connectionError}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card className="glass border-border/50 shadow-2xl backdrop-blur-xl bg-card/80">
              <CardHeader className="space-y-1 text-center pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4, type: "spring" }}
                >
                  <CardTitle className="text-2xl font-bold text-card-foreground flex items-center justify-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    تسجيل الدخول
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 }}
                >
                  <CardDescription className="text-muted-foreground">
                    أدخل بيانات الدخول للوصول إلى النظام
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.8 }}
                    >
                      <FormField
                        control={form.control}
                        name="username"
                        rules={{
                          required: "اسم المستخدم مطلوب",
                          minLength: { value: 3, message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-card-foreground flex items-center gap-2">
                              <User className="h-4 w-4" />
                              اسم المستخدم
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="أدخل اسم المستخدم"
                                  {...field}
                                  disabled={isLoading}
                                  className="text-right bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12"
                                />
                                <motion.div
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </motion.div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2 }}
                    >
                      <FormField
                        control={form.control}
                        name="password"
                        rules={{
                          required: "كلمة المرور مطلوبة",
                          minLength: { value: 6, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-card-foreground flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              كلمة المرور
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="أدخل كلمة المرور"
                                  {...field}
                                  disabled={isLoading}
                                  className="text-right bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 pr-12"
                                />
                                <motion.div
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                </motion.div>
                                <motion.div
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-muted text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                  >
                                    <motion.div
                                      animate={{ rotate: showPassword ? 180 : 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </motion.div>
                                  </Button>
                                </motion.div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 2.2 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          <AnimatePresence mode="wait">
                            {isLoading ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2"
                              >
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Loader2 className="h-4 w-4" />
                                </motion.div>
                                جاري تسجيل الدخول...
                              </motion.div>
                            ) : (
                              <motion.div
                                key="login"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2"
                              >
                                <Sparkles className="h-4 w-4" />
                                تسجيل الدخول
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 3 }}
          >
            <motion.p
              className="text-sm text-muted-foreground"
              whileHover={{ scale: 1.05 }}
            >
              © 2024 متجر الإلكترونيات الذكي. جميع الحقوق محفوظة.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}