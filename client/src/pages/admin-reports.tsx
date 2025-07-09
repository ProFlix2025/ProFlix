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
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  MessageSquare,
  Video
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VideoReport {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  reportType: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  reporterIp: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminReports() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<VideoReport | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/admin/reports"],
    staleTime: 30000,
  });

  const handleReportMutation = useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: "approve" | "reject" }) => 
      apiRequest("POST", `/api/admin/reports/${reportId}/${action}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({
        title: variables.action === "approve" ? "Report Approved" : "Report Rejected",
        description: `Video report has been ${variables.action}d successfully`,
      });
      setSelectedReport(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process report",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getReportTypeBadge = (type: string) => {
    const colors = {
      copyright: "bg-red-500/20 text-red-500",
      "hate-speech": "bg-orange-500/20 text-orange-500",
      inappropriate: "bg-yellow-500/20 text-yellow-500",
      spam: "bg-blue-500/20 text-blue-500",
      fraud: "bg-purple-500/20 text-purple-500",
      other: "bg-gray-500/20 text-gray-500",
    };
    
    return colors[type as keyof typeof colors] || colors.other;
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
          <AlertTriangle className="w-8 h-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">Content Reports</h1>
          <Badge variant="secondary" className="bg-netflix-red/20 text-netflix-red">
            {reports.filter((r: VideoReport) => r.status === "pending").length} Pending
          </Badge>
        </div>

        {reports.length === 0 ? (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Reports</h3>
              <p className="text-netflix-light-gray">
                No content reports have been submitted yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white">Content Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-netflix-border">
                    <TableHead className="text-netflix-light-gray">Video</TableHead>
                    <TableHead className="text-netflix-light-gray">Report Type</TableHead>
                    <TableHead className="text-netflix-light-gray">Reporter</TableHead>
                    <TableHead className="text-netflix-light-gray">Submitted</TableHead>
                    <TableHead className="text-netflix-light-gray">Status</TableHead>
                    <TableHead className="text-netflix-light-gray">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report: VideoReport) => (
                    <TableRow key={report.id} className="border-netflix-border">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-netflix-light-gray" />
                          <div>
                            <div className="font-medium">{report.videoTitle || "Unknown Title"}</div>
                            <div className="text-sm text-netflix-light-gray">ID: {report.videoId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getReportTypeBadge(report.reportType)}>
                          {report.reportType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-netflix-light-gray" />
                          <div>
                            <div>{report.reporterName || "Anonymous"}</div>
                            <div className="text-sm text-netflix-light-gray">{report.reporterEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-netflix-light-gray">
                        {formatDate(report.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={report.status === "pending" ? "secondary" : "default"}
                          className={
                            report.status === "pending" 
                              ? "bg-yellow-500/20 text-yellow-500"
                              : report.status === "approved"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }
                        >
                          {report.status}
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
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="w-4 h-4" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-netflix-gray border-netflix-border max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Review Content Report
                                </DialogTitle>
                              </DialogHeader>
                              
                              {selectedReport && (
                                <div className="space-y-6">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-white font-semibold mb-2">Video Information</h4>
                                      <div className="space-y-2 text-netflix-light-gray">
                                        <p><span className="text-white">Video ID:</span> {selectedReport.videoId}</p>
                                        <p><span className="text-white">Title:</span> {selectedReport.videoTitle || "Unknown"}</p>
                                        <p><span className="text-white">URL:</span> {selectedReport.videoUrl || "Not provided"}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-white font-semibold mb-2">Reporter Information</h4>
                                      <div className="space-y-2 text-netflix-light-gray">
                                        <p><span className="text-white">Name:</span> {selectedReport.reporterName || "Anonymous"}</p>
                                        <p><span className="text-white">Email:</span> {selectedReport.reporterEmail}</p>
                                        <p><span className="text-white">IP Address:</span> {selectedReport.reporterIp}</p>
                                        <p><span className="text-white">Submitted:</span> {formatDate(selectedReport.createdAt)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-white font-semibold mb-2">Report Details</h4>
                                    <div className="space-y-2">
                                      <p className="text-netflix-light-gray">
                                        <span className="text-white">Type:</span>{" "}
                                        <Badge className={getReportTypeBadge(selectedReport.reportType)}>
                                          {selectedReport.reportType}
                                        </Badge>
                                      </p>
                                      <div className="bg-netflix-black p-4 rounded border border-netflix-border">
                                        <p className="text-white">{selectedReport.description}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {selectedReport.status === "pending" && (
                                    <div className="flex justify-end gap-4 pt-4 border-t border-netflix-border">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleReportMutation.mutate({ reportId: selectedReport.id, action: "reject" })}
                                        disabled={handleReportMutation.isPending}
                                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Report
                                      </Button>
                                      <Button
                                        onClick={() => handleReportMutation.mutate({ reportId: selectedReport.id, action: "approve" })}
                                        disabled={handleReportMutation.isPending}
                                        className="bg-netflix-red hover:bg-red-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Take Action
                                      </Button>
                                    </div>
                                  )}
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