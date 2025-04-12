
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { API_CONFIG } from '@/config';
import axios from 'axios';

// Fix the missing 'index' property
const EmailVerification = () => {
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Extract email from URL if available
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);
  
  const handleVerify = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setError(null);
    setIsVerifying(true);
    
    try {
      const response = await axios.post(`${API_CONFIG.baseURL}/auth/verify-email`, {
        email,
        verification_code: code
      });
      
      setSuccess(true);
      
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified. You can now sign in.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to verify email. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setError(null);
    setIsResending(true);
    
    try {
      await axios.post(`${API_CONFIG.baseURL}/auth/resend-verification`, {
        email
      });
      
      toast({
        title: "Verification code resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-md mx-auto pt-16 pb-8 px-4">
        <Card className="animate-fade-up">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Email successfully verified! Redirecting you to login...
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={success}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={code} 
                  onChange={(value) => setCode(value)}
                  disabled={success}
                  pattern="^[0-9]+$"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot 
                        key={i} 
                        index={i}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full" 
              onClick={handleVerify}
              disabled={isVerifying || success}
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
            
            <div className="text-center text-sm">
              <button 
                onClick={handleResendCode} 
                className="text-primary hover:underline"
                disabled={isResending || success}
              >
                {isResending ? "Sending..." : "Resend verification code"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
