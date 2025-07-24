import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function Schedule() {
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["/api/schedule"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/schedule", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      setOpen(false);
      setEditingSchedule(null);
      toast({
        title: "Success",
        description: "Schedule created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create schedule.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/schedule/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      setOpen(false);
      setEditingSchedule(null);
      toast({
        title: "Success",
        description: "Schedule updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update schedule.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({
        title: "Success",
        description: "Schedule deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete schedule.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
    };

    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      deleteMutation.mutate(id);
    }
  };

  const isAdmin = user?.role === "admin";

  // Calendar generation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const schedulesByDate = new Map();
  schedules?.forEach((schedule: any) => {
    const date = schedule.date;
    if (!schedulesByDate.has(date)) {
      schedulesByDate.set(date, []);
    }
    schedulesByDate.get(date).push(schedule);
  });

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(year, month + direction, 1));
  };

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Schedule Management</h2>
              <p className="text-sm text-muted-foreground">
                Plan and organize VIS program activities
              </p>
            </div>
            {isAdmin && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSchedule ? "Edit Event" : "Add New Event"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          defaultValue={
                            editingSchedule?.date || new Date().toISOString().split('T')[0]
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          name="time"
                          type="time"
                          defaultValue={editingSchedule?.time || ""}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingSchedule?.title || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        defaultValue={editingSchedule?.location || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        rows={3}
                        defaultValue={editingSchedule?.description || ""}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setOpen(false);
                          setEditingSchedule(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {editingSchedule ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading schedule...</div>
          ) : (
            <div>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === month;
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dateStr = day.toISOString().split('T')[0];
                  const daySchedules = schedulesByDate.get(dateStr) || [];

                  return (
                    <div
                      key={index}
                      className={`h-24 p-1 border rounded ${
                        isCurrentMonth
                          ? "border-border"
                          : "border-border/50 bg-muted/20"
                      } ${isToday ? "bg-primary/10 border-primary" : ""}`}
                    >
                      <div
                        className={`text-xs font-medium ${
                          isCurrentMonth
                            ? isToday
                              ? "text-primary"
                              : "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="mt-1 space-y-1">
                        {daySchedules.slice(0, 2).map((schedule: any) => (
                          <div
                            key={schedule.id}
                            className="text-xs p-1 bg-primary/20 text-primary rounded truncate cursor-pointer"
                            onClick={() => isAdmin && handleEdit(schedule)}
                          >
                            {schedule.title}
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{daySchedules.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules && schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules
                .filter((schedule: any) => new Date(schedule.date) >= new Date())
                .slice(0, 5)
                .map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{schedule.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(schedule.date).toLocaleDateString()} at {schedule.time}
                        </div>
                        {schedule.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {schedule.location}
                          </div>
                        )}
                      </div>
                      {schedule.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {schedule.description}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No upcoming events</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
