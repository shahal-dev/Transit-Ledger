import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LanguageSelector from "@/components/ui/language-selector";
import { Menu, X, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setIsMenuOpen(false);
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="material-icons text-primary text-2xl">train</span>
            <div>
              <h1 className="text-primary font-bold text-xl">TransitLedger</h1>
              <p className="text-xs text-neutral">Modern Railway Ticketing</p>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link 
            href="/tickets"
            className={`text-sm font-medium ${location === '/tickets' ? 'text-primary' : 'text-neutral hover:text-primary'}`}
          >
            Browse Tickets
          </Link>
          {user && (
            <>
              <Link 
                href="/my-tickets"
                className={`text-sm font-medium ${location === '/my-tickets' ? 'text-primary' : 'text-neutral hover:text-primary'}`}
              >
                My Tickets
              </Link>
              <Link 
                href="/my-wallet"
                className={`text-sm font-medium ${location === '/my-wallet' ? 'text-primary' : 'text-neutral hover:text-primary'}`}
              >
                My Wallet
              </Link>
              {user.verified && (
                <Link 
                  href="/verify-ticket"
                  className={`text-sm font-medium ${location === '/verify-ticket' ? 'text-primary' : 'text-neutral hover:text-primary'}`}
                >
                  Verify Ticket
                </Link>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          
          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 bg-primary/10 rounded-full px-3 py-1 text-primary hover:bg-primary/20 transition">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-primary">{user.fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild className="text-primary font-medium cursor-pointer">
                    <Link href="/profile" className="w-full">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/my-tickets" className="w-full cursor-pointer text-neutral-700 hover:text-primary">
                        My Tickets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-wallet" className="w-full cursor-pointer text-neutral-700 hover:text-primary">
                        My Wallet
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-neutral-700 hover:text-primary"
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:block">
              <Button asChild variant="default" className="bg-primary hover:bg-primary-dark">
                <Link href="/auth">
                  Login / Register
                </Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-neutral-dark" />
            ) : (
              <Menu className="h-6 w-6 text-neutral-dark" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link 
              href="/tickets"
              className={`px-4 py-2 rounded-md ${location === '/tickets' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Tickets
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/my-tickets"
                  className={`px-4 py-2 rounded-md ${location === '/my-tickets' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Tickets
                </Link>
                <Link 
                  href="/my-wallet"
                  className={`px-4 py-2 rounded-md ${location === '/my-wallet' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Wallet
                </Link>
                {user.verified && (
                  <Link 
                    href="/verify-ticket"
                    className={`px-4 py-2 rounded-md ${location === '/verify-ticket' ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Verify Ticket
                  </Link>
                )}
                <div className="border-t border-gray-100 pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-neutral-dark"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/auth">
                <a 
                  className="px-4 py-2 bg-primary text-white rounded-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Register
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
