export default function HowItWorks() {
  return (
    <section className="py-12 bg-neutral-lightest">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <p className="text-center text-neutral max-w-2xl mx-auto mb-12">
          Follow these simple steps to purchase and use your digital train tickets
        </p>
        
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-white rounded-lg p-6 shadow-md h-full">
              <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">1</div>
              <h3 className="font-semibold mb-2">Register</h3>
              <p className="text-sm text-neutral">Create an account with your NID or passport for verification.</p>
            </div>
            {/* Only show connector on desktop for steps 1-3 */}
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary"></div>
          </div>
          
          {/* Step 2 */}
          <div className="relative">
            <div className="bg-white rounded-lg p-6 shadow-md h-full">
              <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">2</div>
              <h3 className="font-semibold mb-2">Browse Tickets</h3>
              <p className="text-sm text-neutral">Search for available train tickets based on your route and date.</p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary"></div>
          </div>
          
          {/* Step 3 */}
          <div className="relative">
            <div className="bg-white rounded-lg p-6 shadow-md h-full">
              <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">3</div>
              <h3 className="font-semibold mb-2">Pay Online</h3>
              <p className="text-sm text-neutral">Complete payment using bKash, Nagad or other supported methods.</p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary"></div>
          </div>
          
          {/* Step 4 */}
          <div>
            <div className="bg-white rounded-lg p-6 shadow-md h-full">
              <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">4</div>
              <h3 className="font-semibold mb-2">Get QR Ticket</h3>
              <p className="text-sm text-neutral">Receive your digital ticket with QR code for easy verification at stations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
