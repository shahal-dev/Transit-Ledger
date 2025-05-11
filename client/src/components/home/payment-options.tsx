export default function PaymentOptions() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Easy Payment Options</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-[url('https://www.idfcfirstbank.com/content/dam/idfcfirstbank/images/blog/mobile-banking/benefits-of-mobile-banking-for-business-717x404.jpg')] mx-auto rounded-lg shadow-md mb-4 h-48 bg-cover bg-center"></div>
            <h3 className="font-semibold text-lg mb-2">Mobile Banking</h3>
            <p className="text-neutral">Pay directly from your mobile banking accounts with bKash, Nagad, and Rocket.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-[url('https://plus.unsplash.com/premium_photo-1664202219850-0ed2a085aaa9?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] mx-auto rounded-lg shadow-md mb-4 h-48 bg-cover bg-center"></div>

            <h3 className="font-semibold text-lg mb-2">Card Payment</h3>
            <p className="text-neutral">Use your debit or credit cards for secure, instant payment processing.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center mt-8 space-x-2 md:space-x-6">
          <div className="bg-neutral-lightest p-3 rounded-lg mb-2">
            <div className="h-8 w-20 bg-red-500 rounded flex items-center justify-center text-white font-bold">
              bKash
            </div>
          </div>
          <div className="bg-neutral-lightest p-3 rounded-lg mb-2">
            <div className="h-8 w-20 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
              Nagad
            </div>
          </div>
          <div className="bg-neutral-lightest p-3 rounded-lg mb-2">
            <div className="h-8 w-20 bg-purple-500 rounded flex items-center justify-center text-white font-bold">
              Rocket
            </div>
          </div>
          <div className="bg-neutral-lightest p-3 rounded-lg mb-2">
            <div className="h-8 w-20 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              Visa
            </div>
          </div>
          <div className="bg-neutral-lightest p-3 rounded-lg mb-2">
            <div className="h-8 w-20 bg-red-600 rounded flex items-center justify-center text-white font-bold">
              Master
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
