import Hero from "@/components/Hero";
import Subject from "@/components/Subject";
import TrainingLog from "@/components/TrainingLog";
import CaseFiles from "@/components/CaseFiles";
import FieldRecord from "@/components/FieldRecord";
import Evidence from "@/components/Evidence";
import Contact from "@/components/Contact";
import Ending from "@/components/Ending";

export default function Home() {
  return (
    <>
      <Hero />
      <Subject />
      <TrainingLog />
      <CaseFiles />
      <FieldRecord />
      <Evidence />
      <Contact />
      <Ending />
    </>
  );
}
