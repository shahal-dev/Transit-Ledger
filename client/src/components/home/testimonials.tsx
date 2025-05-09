export default function Testimonials() {
  const testimonials = [
    {
      stars: 5,
      text: "TransitLedger has made my regular commute so much easier. No more standing in long queues to buy tickets!",
      name: "Fahim Ahmed",
      role: "Regular Commuter"
    },
    {
      stars: 4.5,
      text: "The QR code system is brilliant! It's faster and more secure than traditional paper tickets.",
      name: "Nusrat Jahan",
      role: "Business Traveler"
    },
    {
      stars: 5,
      text: "Being able to buy tickets from home and pay with bKash is convenient. This system is what Bangladesh needed!",
      name: "Rafiq Islam",
      role: "Tourist"
    }
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center mb-4">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="material-icons text-yellow-300">star</span>
        ))}
        {hasHalfStar && <span className="material-icons text-yellow-300">star_half</span>}
      </div>
    );
  };

  return (
    <section className="py-12 bg-primary text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">What Our Users Say</h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white bg-opacity-10 p-6 rounded-lg">
              {renderStars(testimonial.stars)}
              <p className="italic mb-4">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full mr-3 flex items-center justify-center">
                  <span className="material-icons">person</span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-neutral-lightest">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
