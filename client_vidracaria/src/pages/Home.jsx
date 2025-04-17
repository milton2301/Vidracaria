import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Sobre from '../components/Sobre'
import Servicos from '../components/Servicos'
import Galeria from '../components/Galeria'
import Contato from '../components/Contato'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Sobre />
      <Servicos />
      <Galeria />
      <Contato />
      <Footer />
    </>
  )
}
