import Hero from '../components/sections/Hero';
import ProductsGrid from '../components/sections/ProductsGrid';
import StepFlow from '../components/sections/StepFlow';
import Personas from '../components/sections/Personas';
import CTASection from '../components/sections/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <ProductsGrid />
      <StepFlow />
      <Personas />
      <CTASection />
    </>
  );
}
