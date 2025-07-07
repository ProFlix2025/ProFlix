import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedCardPurchase from "./SavedCardPurchase";
import SaveCardSetup from "./SaveCardSetup";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Zap } from "lucide-react";

interface QuickPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
  price: number;
  videoTitle: string;
  onSuccess: () => void;
}

export default function QuickPurchaseModal({ 
  isOpen, 
  onClose, 
  videoId, 
  price, 
  videoTitle, 
  onSuccess 
}: QuickPurchaseModalProps) {
  const [activeTab, setActiveTab] = useState("quick");

  // Check if user has saved cards
  const { data: savedCards = [] } = useQuery({
    queryKey: ['/api/payment-methods'],
    enabled: isOpen,
  });

  // Check PIN status
  const { data: pinStatus } = useQuery({
    queryKey: ['/api/purchase-pin/status'],
    enabled: isOpen,
  });

  const hasSavedCards = savedCards.length > 0;
  const hasPinSet = pinStatus?.hasPinSet;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-netflix-black border-netflix-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Purchase Course
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-netflix-gray">
            <TabsTrigger 
              value="quick" 
              className="data-[state=active]:bg-netflix-red data-[state=active]:text-white"
              disabled={!hasSavedCards || !hasPinSet}
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Purchase (PIN)
            </TabsTrigger>
            <TabsTrigger 
              value="setup" 
              className="data-[state=active]:bg-netflix-red data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {hasSavedCards ? "Regular Purchase" : "Setup Saved Card"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-6">
            {hasSavedCards && hasPinSet ? (
              <SavedCardPurchase
                videoId={videoId}
                price={price}
                videoTitle={videoTitle}
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            ) : (
              <div className="text-center py-8">
                <div className="bg-netflix-gray p-6 rounded-lg">
                  <Zap className="w-12 h-12 text-netflix-red mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Quick Purchase Not Available
                  </h3>
                  <p className="text-netflix-light-gray mb-4">
                    You need to save a payment method and set up a PIN first.
                  </p>
                  <Button
                    onClick={() => setActiveTab("setup")}
                    className="bg-netflix-red hover:bg-red-700"
                  >
                    Set Up Quick Purchase
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="setup" className="mt-6">
            <SaveCardSetup
              onSuccess={() => {
                setActiveTab("quick");
                // Optionally refresh the queries
              }}
              onCancel={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}