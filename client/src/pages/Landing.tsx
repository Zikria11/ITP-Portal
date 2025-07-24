import { useState } from "react";
import { Shield, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/components/ThemeProvider";
import StudentSignupModal from "@/components/StudentSignupModal";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [showStudentSignup, setShowStudentSignup] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-6">
            <Shield className="text-primary-foreground text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            VIS Program Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Islamabad Traffic Police
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              onClick={() => (window.location.href = "/api/login")}
              className="w-full"
            >
              Sign in
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Student?{" "}
                <button
                  onClick={() => setShowStudentSignup(true)}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Create an account
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dark Mode Toggle */}
        <div className="text-center">
          <Button variant="ghost" onClick={toggleTheme} className="gap-2">
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                Light mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Dark mode
              </>
            )}
          </Button>
        </div>
      </div>

      <StudentSignupModal
        open={showStudentSignup}
        onOpenChange={setShowStudentSignup}
      />
    </div>
  );
}
