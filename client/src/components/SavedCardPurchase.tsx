import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, Shield, Mail } from "lucide-react";

interface SavedCardPurchaseProps {
  videoId: number;
  price: number;
  videoTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SavedCardPurchase({ 
  videoId, 
  price, 
  videoTitle, 
  onSuccess, 
  onCancel 
}: SavedCardPurchaseProps) {
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Get user's saved cards
  const { data: savedCards = [], isLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
  });

  // Get user's PIN status
  const { data: pinStatus } = useQuery({
    queryKey: ['/api/purchase-pin/status'],
  });

  // Purchase with PIN mutation
  const purchaseWithPin = useMutation({
    mutationFn: async (data: { videoId: number; pin: string }) => {
      return apiRequest("POST", "/api/purchase-with-pin", data);
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: `You now have access to "${videoTitle}"`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-purchases'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Please check your PIN and try again",
        variant: "destructive",
      });
    },
  });

  // Send PIN reset email mutation
  const sendPinReset = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/purchase-pin/reset");
    },
    onSuccess: () => {
      toast({
        title: "PIN Reset Email Sent",
        description: "Check your email for instructions to reset your PIN",
      });
    },
  });

  const handlePurchase = async () => {
    if (!pin || pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your 6-digit purchase PIN",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await purchaseWithPin.mutateAsync({ videoId, pin });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinInput = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPin(numericValue);
  };

  if (isLoading) {
    return (
      <Card className="bg-netflix-black border-netflix-border">
        <CardContent className="p-6">
          <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // If no saved cards, show setup message
  if (!savedCards.length) {
    return (
      <Card className="bg-netflix-black border-netflix-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            No Saved Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-netflix-light-gray">
            You need to save a payment method first to use PIN purchases.
          </p>
          <Button 
            onClick={onCancel}
            className="w-full bg-netflix-red hover:bg-red-700"
          >
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
    );
  }

  const defaultCard = savedCards.find((card: any) => card.isDefault) || savedCards[0];

  return (
    <Card className="bg-netflix-black border-netflix-border max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-netflix-red" />
          Quick Purchase
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Course Info */}
        <div className="text-center">
          <h3 className="text-white font-semibold text-lg mb-2">{videoTitle}</h3>
          <div className="text-3xl font-bold text-netflix-red">${price}</div>
        </div>

        {/* Default Card Display */}
        <div className="bg-netflix-gray p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-netflix-light-gray" />
              <div>
                <div className="text-white font-medium">
                  {defaultCard.cardBrand.toUpperCase()} •••• {defaultCard.cardLast4}
                </div>
                <div className="text-netflix-light-gray text-sm">
                  Expires {defaultCard.cardExpMonth}/{defaultCard.cardExpYear}
                </div>
              </div>
            </div>
            {defaultCard.isDefault && (
              <Badge variant="secondary" className="bg-netflix-red text-white">
                Default
              </Badge>
            )}
          </div>
        </div>

        {/* PIN Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-netflix-red" />
            <label className="text-white font-medium">
              Enter your 6-digit PIN
            </label>
          </div>
          
          <Input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => handlePinInput(e.target.value)}
            placeholder="••••••"
            className="bg-netflix-gray border-netflix-border text-white text-center text-2xl tracking-widest"
            maxLength={6}
          />
          
          <button
            onClick={() => sendPinReset.mutate()}
            className="flex items-center gap-2 text-netflix-light-gray hover:text-white text-sm transition-colors mx-auto"
            disabled={sendPinReset.isPending}
          >
            <Mail className="w-4 h-4" />
            Forgot PIN? Send reset email
          </button>
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
            onClick={handlePurchase}
            disabled={pin.length !== 6 || isProcessing || purchaseWithPin.isPending}
            className="flex-1 bg-netflix-red hover:bg-red-700"
          >
            {isProcessing || purchaseWithPin.isPending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              `Purchase for $${price}`
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-center text-netflix-light-gray text-xs">
          <Shield className="w-4 h-4 inline mr-1" />
          Your PIN is encrypted and secure. We'll never share your payment details.
        </div>
      </CardContent>
    </Card>
  );
}