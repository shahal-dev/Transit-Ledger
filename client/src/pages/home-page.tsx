import HeroSection from "@/components/home/hero-section";
import FeaturesSection from "@/components/home/features-section";
import HowItWorks from "@/components/home/how-it-works";
import TicketSearch from "@/components/home/ticket-search";
import PaymentOptions from "@/components/home/payment-options";
import QRVerification from "@/components/home/qr-verification";
import Testimonials from "@/components/home/testimonials";
import CallToAction from "@/components/home/call-to-action";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>TransitLedger - Modern Railway Ticketing</title>
        <meta name="description" content="Secure, convenient, and hassle-free train tickets at your fingertips. Bangladesh's digital train ticketing platform." />
      </Helmet>
      
      <HeroSection />
      <TicketSearch />

      <FeaturesSection />
      <HowItWorks />
      <PaymentOptions />
      <QRVerification />
      <Testimonials />
      <CallToAction />
    </>
  );
}
