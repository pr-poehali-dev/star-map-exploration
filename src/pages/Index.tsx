import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { Services } from "@/components/Services"
import { Philosophy } from "@/components/Philosophy"
import { Testimonial } from "@/components/Testimonial"
import { Process } from "@/components/Process"
import { Contact } from "@/components/Contact"
import { Footer } from "@/components/Footer"

export default function Index() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Philosophy />
      <Testimonial />
      <Process />
      <Contact />
      <Footer />
    </main>
  )
}
