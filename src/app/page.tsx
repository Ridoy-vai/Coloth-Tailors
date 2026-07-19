import Hero from "./component/Hero";
import GenderSection from "./component/GenderSection";
import ProcessSection from "./component/Processsection";
import FabricLibrarySection from "./component/Fabriclibrarysection";
import TestimonialsSection from "./component/Testimonialssection";
import BookFittingSection from "./component/Bookfittingsection";

export default function Home() {
  return (
    <>
      <Hero />
      <GenderSection />
      <ProcessSection/>
      <FabricLibrarySection/>
      <TestimonialsSection/>
      <BookFittingSection />
    </>
  );
}
