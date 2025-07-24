import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["/api/attendance", { date: selectedDate }],
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/attendance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Attendance Updated",
        description: "Student attendance has been marked successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update attendance.",
        variant: "destructive",
      });
    },
  });

  const toggleAttendance = (studentId: number, newStatus: string) => {
    markAttendanceMutation.mutate({
      studentId,
      date: selectedDate,
      status: newStatus,
    });
  };

  const markAllAttendance = (status: string) => {
    if (!(students as any)) return;
    
    (students as any).forEach((student: any) => {
      markAttendanceMutation.mutate({
        studentId: student.id,
        date: selectedDate,
        status: status,
      });
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const attendanceMap = new Map();
  (attendance as any)?.forEach((record: any) => {
    attendanceMap.set(record.studentId, record.status);
  });

  const presentCount = (attendance as any)?.filter((a: any) => a.status === "present").length || 0;
  const absentCount = ((students as any)?.length || 0) - presentCount;

  return (
    <div className="space-y-6">
      {/* Attendance Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Attendance Management</h2>
              <p className="text-sm text-muted-foreground">
                Mark and track student attendance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Button 
                variant="outline" 
                className="gap-2 bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                onClick={() => markAllAttendance("present")}
                disabled={markAttendanceMutation.isPending}
              >
                Mark All Present
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 bg-red-50 border-red-200 text-red-800 hover:bg-red-100"
                onClick={() => markAllAttendance("absent")}
                disabled={markAttendanceMutation.isPending}
              >
                Mark All Absent
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student List</CardTitle>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-muted-foreground">
                Present: <span className="font-medium text-green-600">{presentCount}</span>
              </span>
              <span className="text-muted-foreground">
                Absent: <span className="font-medium text-red-600">{absentCount}</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading attendance...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">Reg No</th>
                    <th className="text-left py-3 px-4 font-medium">Batch</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(students as any)?.map((student: any) => {
                    const status = attendanceMap.get(student.id) || "absent";
                    return (
                      <tr key={student.id} className="border-b">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-foreground">
                                {getInitials(student.name)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">
                                {student.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {student.regNo}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {student.batch}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={status === "present" ? "default" : "secondary"}
                            className={
                              status === "present"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }
                          >
                            {status === "present" ? "Present" : "Absent"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant={status === "present" ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleAttendance(student.id, "present")}
                              disabled={markAttendanceMutation.isPending}
                              className={status === "present" ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-600 text-green-600 hover:bg-green-50"}
                            >
                              Present
                            </Button>
                            <Button
                              variant={status === "absent" ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleAttendance(student.id, "absent")}
                              disabled={markAttendanceMutation.isPending}
                              className={status === "absent" ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-600 text-red-600 hover:bg-red-50"}
                            >
                              Absent
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
