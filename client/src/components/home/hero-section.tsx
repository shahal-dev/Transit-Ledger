import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative bg-primary text-white overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Bangladesh's Digital Train Ticketing Platform</h2>
          <p className="mb-8 text-neutral-lightest">Secure, convenient, and hassle-free train tickets at your fingertips.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/tickets">
              <Button className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg">
                Buy Tickets Now
              </Button>
            </Link>
            <Button variant="outline" className="bg-white hover:bg-neutral-lightest text-primary font-semibold px-6 py-3 rounded-lg transition shadow-lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0">
        <div className="object-cover w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1713104343256-57f058ed1474?w=1500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDYzfHx8ZW58MHx8fHx8')]"></div>
      </div>
      
      {/* Animated Train Icon */}
      <div className="absolute bottom-4 left-0 w-full overflow-hidden pointer-events-none">
        <span className="material-icons text-white text-6xl opacity-30 animate-train">directions_railway</span>
      </div>
    </section>
  );
}
