import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: todaySchedule } = useQuery({
    queryKey: ["/api/schedule", { date: new Date().toISOString().split('T')[0] }],
  });

  const { data: recentHighlights } = useQuery({
    queryKey: ["/api/highlights"],
  });

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-semibold">{stats?.totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Present Today
                </p>
                <p className="text-2xl font-semibold">{stats?.presentToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Approvals
                </p>
                <p className="text-2xl font-semibold">{stats?.pendingApprovals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Events
                </p>
                <p className="text-2xl font-semibold">{stats?.upcomingEvents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Schedule</CardTitle>
              <Link href="/schedule">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {todaySchedule && todaySchedule.length > 0 ? (
              <div className="space-y-4">
                {todaySchedule.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.time}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      {item.location && (
                        <p className="text-sm text-muted-foreground">
                          {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events scheduled for today</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <Link href="/attendance">
                <Button className="w-full">Mark Attendance</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Highlights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Highlights</CardTitle>
            <Link href="/highlights">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentHighlights && recentHighlights.length > 0 ? (
            <div className="space-y-4">
              {recentHighlights.slice(0, 3).map((highlight: any) => (
                <div
                  key={highlight.id}
                  className="border-l-4 border-primary pl-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {highlight.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(highlight.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No highlights available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
