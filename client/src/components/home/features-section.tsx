export default function FeaturesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">Why Choose TransitLedger?</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-neutral-lightest p-6 rounded-lg text-center">
            <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-primary text-2xl">verified_user</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure Verification</h3>
            <p className="text-neutral">NID or passport verification ensures a secure and reliable ticketing process.</p>
          </div>
          
          <div className="bg-neutral-lightest p-6 rounded-lg text-center">
            <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-primary text-2xl">qr_code_scanner</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">QR Code Tickets</h3>
            <p className="text-neutral">Easy verification at stations with digital QR code tickets on your mobile device.</p>
          </div>
          
          <div className="bg-neutral-lightest p-6 rounded-lg text-center">
            <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-primary text-2xl">payments</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Easy Payment</h3>
            <p className="text-neutral">Integrated with popular mobile payment systems like bKash and Nagad.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
