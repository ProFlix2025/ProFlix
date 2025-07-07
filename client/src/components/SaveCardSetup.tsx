import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, Lock } from "lucide-react";

interface SaveCardSetupProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SaveCardSetup({ onSuccess, onCancel }: SaveCardSetupProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Setup saved card and PIN mutation
  const setupSavedCard = useMutation({
    mutationFn: async (data: { pin: string }) => {
      return apiRequest("POST", "/api/setup-saved-card", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Setup Complete!",
        description: "Your card has been saved and PIN is set. You can now make quick purchases!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSetup = async () => {
    if (!pin || pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 6 digits",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs Don't Match",
        description: "Please make sure both PINs are identical",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await setupSavedCard.mutateAsync({ pin });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinInput = (value: string, setter: (v: string) => void) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setter(numericValue);
  };

  return (
    <Card className="bg-netflix-black border-netflix-border max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-netflix-red" />
          Save Card & Set PIN
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Info */}
        <div className="bg-netflix-gray p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-netflix-red mt-1" />
            <div className="text-sm text-netflix-light-gray">
              <p className="font-medium text-white mb-2">Quick Purchase Benefits:</p>
              <ul className="space-y-1">
                <li>• One-click course purchases</li>
                <li>• Secure 6-digit PIN protection</li>
                <li>• No need to re-enter card details</li>
                <li>• PIN reset via email if forgotten</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PIN Setup */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-netflix-red" />
              <label className="text-white font-medium">
                Create 6-digit PIN
              </label>
            </div>
            
            <Input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setPin)}
              placeholder="••••••"
              className="bg-netflix-gray border-netflix-border text-white text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-white font-medium">
              Confirm PIN
            </label>
            
            <Input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
              placeholder="••••••"
              className="bg-netflix-gray border-netflix-border text-white text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>
        </div>

        {/* PIN Requirements */}
        <div className="text-netflix-light-gray text-sm space-y-1">
          <p className="font-medium">PIN Requirements:</p>
          <ul className="space-y-1 text-xs">
            <li className={pin.length === 6 ? "text-green-400" : ""}>
              • Must be exactly 6 digits
            </li>
            <li className={pin === confirmPin && pin.length === 6 ? "text-green-400" : ""}>
              • Both PINs must match
            </li>
            <li>• Avoid obvious patterns (123456, 111111)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-netflix-border text-white hover:bg-netflix-gray"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSetup}
            disabled={pin.length !== 6 || pin !== confirmPin || isProcessing || setupSavedCard.isPending}
            className="flex-1 bg-netflix-red hover:bg-red-700"
          >
            {isProcessing || setupSavedCard.isPending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              "Save Card & Set PIN"
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-center text-netflix-light-gray text-xs">
          <Shield className="w-4 h-4 inline mr-1" />
          Your card details are encrypted with Stripe. Your PIN is hashed and secure.
        </div>
      </CardContent>
    </Card>
  );
}