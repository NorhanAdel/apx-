import Image from "next/image";
import About from "./components/About";
import ContactSection from "./components/ContactSection";
import CustomSlider from "./components/CustomSlider";
import Hero from "./components/Hero";
import MissionVisionSlide from "./components/MissionVisionSlide";
import SportsSection from "./components/SportsSection";
 

export default function Home() {
  return (
    <div>
      <Hero/>
      <SportsSection/>
      <About />
      <MissionVisionSlide />
      <CustomSlider/>
      <ContactSection/>
    </div>
  );
}
