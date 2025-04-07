
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  // Check if we have an email in the URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid verification code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        email,
        type: 'signup'
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification code resent to your email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="max-w-md mx-auto mt-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Verify Your Email</h1>
            <p className="text-muted-foreground mt-2">
              Enter the verification code sent to your email
            </p>
          </div>
          
          <div className="bg-card shadow-sm rounded-xl p-6 border animate-fade-up">
            {isVerified ? (
              <div className="py-8 text-center">
                <div className="mb-4 flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                <p className="text-muted-foreground mb-6">
                  Your email has been successfully verified. You will be redirected to the login page shortly.
                </p>
                <Button asChild className="w-full">
                  <div onClick={() => navigate('/login')} className="flex items-center justify-center">
                    Go to Login <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="code" className="block text-sm font-medium">
                      Verification Code
                    </label>
                    <div className="flex justify-center my-4">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
                        render={({ slots }) => (
                          <InputOTPGroup>
                            {slots.map((slot, index) => (
                              <InputOTPSlot key={index} {...slot} />
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleVerify} 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sm text-primary hover:underline"
                    disabled={loading}
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <p>
                    Check your spam folder if you don't see the verification email in your inbox.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
