import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Gift, Settings, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminCodes() {
  const { toast } = useToast();
  const [count, setCount] = useState(10);
  const [expiresInDays, setExpiresInDays] = useState(365);

  const { data: codes, isLoading } = useQuery({
    queryKey: ["/api/admin/codes"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/generate-codes", { count, expiresInDays });
    },
    onSuccess: () => {
      toast({
        title: "Codes Generated!",
        description: `Successfully generated ${count} Pro Creator codes`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/codes"] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate codes",
        variant: "destructive",
      });
    },
  });

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const copyAllCodes = async () => {
    if (!codes) return;
    
    const unused = codes.filter((c: any) => !c.isUsed);
    const codeList = unused.map((c: any) => c.code).join('\n');
    
    await navigator.clipboard.writeText(codeList);
    toast({
      title: "All Codes Copied!",
      description: `${unused.length} unused codes copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-netflix-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-netflix-red" />
            <div>
              <h1 className="text-3xl font-bold text-white">Pro Creator Code Generator</h1>
              <p className="text-netflix-light-gray">
                Generate invitation codes for free 12-month Pro Creator access
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Generation Panel */}
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-netflix-red" />
                Generate New Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="count" className="text-netflix-light-gray">
                  Number of codes (max 50)
                </Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="bg-netflix-black border-netflix-border text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="expires" className="text-netflix-light-gray">
                  Expires in (days)
                </Label>
                <Input
                  id="expires"
                  type="number"
                  min="1"
                  max="3650"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 365)}
                  className="bg-netflix-black border-netflix-border text-white"
                />
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="w-full bg-netflix-red hover:bg-red-700"
              >
                {generateMutation.isPending ? "Generating..." : "Generate Codes"}
              </Button>
            </CardContent>
          </Card>

          {/* Codes List */}
          <div className="lg:col-span-2">
            <Card className="bg-netflix-gray border-netflix-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Generated Codes</CardTitle>
                  <Button
                    onClick={copyAllCodes}
                    variant="outline"
                    size="sm"
                    className="border-netflix-border text-netflix-light-gray hover:bg-netflix-black"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Unused
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-spin w-6 h-6 border-4 border-netflix-red border-t-transparent rounded-full mx-auto" />
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {codes?.map((code: any) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between p-3 bg-netflix-black rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <code className="text-white font-mono text-lg">{code.code}</code>
                          {code.isUsed && (
                            <Badge variant="destructive">
                              Used {code.usedAt ? new Date(code.usedAt).toLocaleDateString() : ''}
                            </Badge>
                          )}
                          {!code.isUsed && (
                            <Badge className="bg-green-600 text-white">Available</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-netflix-light-gray text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'No expiry'}
                          </span>
                          <Button
                            onClick={() => copyCode(code.code)}
                            variant="ghost"
                            size="sm"
                            className="text-netflix-light-gray hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {codes?.length === 0 && (
                      <div className="text-center py-8">
                        <Gift className="w-12 h-12 text-netflix-light-gray mx-auto mb-4" />
                        <p className="text-netflix-light-gray">No codes generated yet</p>
                        <p className="text-netflix-light-gray text-sm">
                          Generate your first batch of invitation codes
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}