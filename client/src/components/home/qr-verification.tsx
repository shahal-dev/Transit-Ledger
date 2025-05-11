export default function QRVerification() {
  return (
    <section className="py-12 bg-neutral-lightest">
      <div className="container mx-auto px-4">
        <div className="md:flex items-center gap-8 max-w-5xl mx-auto">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="bg-[url('https://images.unsplash.com/photo-1571867424488-4565932edb41?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] rounded-lg shadow-lg mx-auto h-64 bg-cover bg-center"></div>
          </div>
          
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Hassle-Free Verification at Stations</h2>
            <p className="text-neutral mb-6">Present your digital ticket's QR code at the station for quick and easy verification by booth operators.</p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full mt-1 mr-4">
                  <span className="material-icons text-white">check</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Paperless Tickets</h3>
                  <p className="text-sm text-neutral">Eco-friendly digital tickets eliminate the need for paper.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full mt-1 mr-4">
                  <span className="material-icons text-white">check</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quick Verification</h3>
                  <p className="text-sm text-neutral">Fast QR scanning means no long queues at verification points.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full mt-1 mr-4">
                  <span className="material-icons text-white">check</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure System</h3>
                  <p className="text-sm text-neutral">Tickets are linked to your NID, preventing fraud and unauthorized transfers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
