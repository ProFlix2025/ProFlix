import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Shield, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PendingVerification {
  id: string;
  email: string;
  legalName: string;
  dateOfBirth: string;
  idDocumentUrl: string;
  idSelfieUrl?: string;
  creatorAgreementSignedAt: string;
  creatorAgreementIpAddress: string;
  idVerificationStatus: "pending" | "approved" | "rejected";
  hasSignedCreatorAgreement: boolean;
  createdAt: string;
}

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);

  const { data: pendingVerifications = [], isLoading } = useQuery({
    queryKey: ["/api/admin/verifications"],
    staleTime: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/admin/verifications/${userId}/approve`),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verifications"] });
      toast({
        title: "Verification Approved",
        description: "Creator verification has been approved successfully",
      });
      setSelectedVerification(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve verification",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/admin/verifications/${userId}/reject`),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verifications"] });
      toast({
        title: "Verification Rejected",
        description: "Creator verification has been rejected",
      });
      setSelectedVerification(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject verification",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">Creator Verifications</h1>
          <Badge variant="secondary" className="bg-netflix-red/20 text-netflix-red">
            {pendingVerifications.length} Pending
          </Badge>
        </div>

        {pendingVerifications.length === 0 ? (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-netflix-light-gray">
                No pending creator verifications at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white">Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-netflix-border">
                    <TableHead className="text-netflix-light-gray">Creator</TableHead>
                    <TableHead className="text-netflix-light-gray">Legal Name</TableHead>
                    <TableHead className="text-netflix-light-gray">Age</TableHead>
                    <TableHead className="text-netflix-light-gray">Submitted</TableHead>
                    <TableHead className="text-netflix-light-gray">Status</TableHead>
                    <TableHead className="text-netflix-light-gray">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVerifications.map((verification: PendingVerification) => (
                    <TableRow key={verification.id} className="border-netflix-border">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-netflix-light-gray" />
                          {verification.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {verification.legalName}
                      </TableCell>
                      <TableCell className="text-white">
                        {calculateAge(verification.dateOfBirth)} years
                      </TableCell>
                      <TableCell className="text-netflix-light-gray">
                        {formatDate(verification.creatorAgreementSignedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={verification.idVerificationStatus === "pending" ? "secondary" : "default"}
                          className="bg-yellow-500/20 text-yellow-500"
                        >
                          {verification.idVerificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-netflix-border text-netflix-light-gray"
                                onClick={() => setSelectedVerification(verification)}
                              >
                                <Eye className="w-4 h-4" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-netflix-gray border-netflix-border max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Review Creator Verification
                                </DialogTitle>
                              </DialogHeader>
                              
                              {selectedVerification && (
                                <div className="space-y-6">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-white font-semibold mb-2">Personal Information</h4>
                                      <div className="space-y-2 text-netflix-light-gray">
                                        <p><span className="text-white">Email:</span> {selectedVerification.email}</p>
                                        <p><span className="text-white">Legal Name:</span> {selectedVerification.legalName}</p>
                                        <p><span className="text-white">Date of Birth:</span> {selectedVerification.dateOfBirth}</p>
                                        <p><span className="text-white">Age:</span> {calculateAge(selectedVerification.dateOfBirth)} years</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-white font-semibold mb-2">Legal Compliance</h4>
                                      <div className="space-y-2 text-netflix-light-gray">
                                        <p><span className="text-white">Agreement Signed:</span> {selectedVerification.hasSignedCreatorAgreement ? "Yes" : "No"}</p>
                                        <p><span className="text-white">Signed At:</span> {formatDate(selectedVerification.creatorAgreementSignedAt)}</p>
                                        <p><span className="text-white">IP Address:</span> {selectedVerification.creatorAgreementIpAddress}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        ID Document
                                      </h4>
                                      <div className="border border-netflix-border rounded-lg p-4">
                                        {selectedVerification.idDocumentUrl ? (
                                          <img 
                                            src={selectedVerification.idDocumentUrl}
                                            alt="ID Document"
                                            className="max-w-full h-auto rounded"
                                          />
                                        ) : (
                                          <p className="text-netflix-light-gray">No document uploaded</p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Selfie with ID (Optional)
                                      </h4>
                                      <div className="border border-netflix-border rounded-lg p-4">
                                        {selectedVerification.idSelfieUrl ? (
                                          <img 
                                            src={selectedVerification.idSelfieUrl}
                                            alt="Selfie with ID"
                                            className="max-w-full h-auto rounded"
                                          />
                                        ) : (
                                          <p className="text-netflix-light-gray">No selfie uploaded</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-4 pt-4 border-t border-netflix-border">
                                    <Button
                                      variant="outline"
                                      onClick={() => rejectMutation.mutate(selectedVerification.id)}
                                      disabled={rejectMutation.isPending}
                                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => approveMutation.mutate(selectedVerification.id)}
                                      disabled={approveMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}