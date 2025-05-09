import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface AdminHeaderProps {
  user: User;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  onRefresh?: () => void;
}

export function AdminHeader({ user, searchTerm, setSearchTerm, handleSearch, onRefresh }: AdminHeaderProps) {
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="hidden md:flex">
            <Button variant="ghost" className="text-lg font-semibold" onClick={() => navigate("/admin")}>
              Transit Ledger Admin
            </Button>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] pl-8 md:w-[300px]"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </div>

        <div className="flex items-center gap-4">
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh Data">
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.photoUrl} />
              <AvatarFallback>
                {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
} 