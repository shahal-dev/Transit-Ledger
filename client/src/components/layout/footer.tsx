import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-neutral-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">TransitLedger</h3>
            <p className="text-neutral-light text-sm mb-4">The future of railway ticketing in Bangladesh.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-light hover:text-white">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-neutral-light hover:text-white">
                <span className="material-icons">twitter</span>
              </a>
              <a href="#" className="text-neutral-light hover:text-white">
                <span className="material-icons">instagram</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-light hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="text-neutral-light hover:text-white">
                  Browse Tickets
                </Link>
              </li>
              <li>
                <Link href="/my-tickets" className="text-neutral-light hover:text-white">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link href="/verify-ticket" className="text-neutral-light hover:text-white">
                  Verify Ticket
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-light hover:text-white">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-neutral-light hover:text-white">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-neutral-light hover:text-white">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-neutral-light hover:text-white">Privacy Policy</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-neutral-light">
              <li className="flex items-center">
                <span className="material-icons text-sm mr-2">location_on</span>
                <span>Kamalapur, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center">
                <span className="material-icons text-sm mr-2">phone</span>
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center">
                <span className="material-icons text-sm mr-2">email</span>
                <span>support@transitledger.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-neutral-light text-sm">
          <p>&copy; {new Date().getFullYear()} TransitLedger. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
