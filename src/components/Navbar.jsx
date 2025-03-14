import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  User,
  LogOut,
  Home,
  IndianRupee,
  ReceiptText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged out successfully",
    });
    setOpen(false);
    navigate("/login");
  };

  const handleNavigation = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6" />
            <span className="font-bold">Expense Manager</span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
                <div className="hidden md:flex space-x-4">
                  <Link to="/personal-expenses">
                    <Button variant="ghost">Personal Expenses</Button>
                  </Link>
                  <Link to="/expenses">
                    <Button variant="ghost">Group Expenses</Button>
                  </Link>
                </div>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="md:hidden"
                      onClick={() => handleNavigation("/personal-expenses")}
                    >
                      <IndianRupee className="mr-2 h-4 w-4" />
                      <span>Personal Expenses</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="md:hidden"
                      onClick={() => handleNavigation("/expenses")}
                    >
                      <ReceiptText className="mr-2 h-4 w-4" />
                      <span>Group Expenses</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="md:hidden" />
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{user.name}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
