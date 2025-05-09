import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function CallToAction() {
  const { user } = useAuth();

  return (
    <section className="py-16 bg-neutral-lightest">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Experience Modern Train Ticketing?</h2>
        <p className="text-neutral max-w-2xl mx-auto mb-8">Join thousands of travelers who have switched to TransitLedger for a seamless and secure train ticketing experience.</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <Link href="/tickets">
              <Button className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg">
                Browse Tickets
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg">
                Register Now
              </Button>
            </Link>
          )}
          <Button variant="outline" className="bg-white border border-primary text-primary hover:bg-primary hover:bg-opacity-10 font-semibold px-8 py-3 rounded-lg transition">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
