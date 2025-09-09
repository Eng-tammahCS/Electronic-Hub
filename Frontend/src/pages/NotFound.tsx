import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertTriangle, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background rtl-layout p-6">
      <Card className="w-full max-w-lg mx-auto text-center animate-fade-in">
        <CardHeader className="pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold gradient-text">
            404
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            عذراً، الصفحة التي تبحث عنها غير موجودة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            الرابط الذي تحاول الوصول إليه قد يكون غير صحيح أو تم حذف الصفحة
          </p>
          
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full flex-row-reverse">
                <Home className="h-4 w-4 ml-2" />
                العودة للصفحة الرئيسية
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full flex-row-reverse"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للصفحة السابقة
            </Button>
          </div>
          
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>المسار المطلوب: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
