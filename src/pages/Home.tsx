import React from 'react';
import Hero from '../components/sections/Hero';
import WhatIDo from '../components/sections/WhatIDo';
import Testimonials from '../components/sections/Testimonials';
import CTABand from '../components/sections/CTABand';

interface HomeProps {
  onStartProject: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartProject }) => (
  <>
    <Hero onStartProject={onStartProject} />
    <WhatIDo onStartProject={onStartProject} />
    <Testimonials />
    <CTABand onStartProject={onStartProject} />
  </>
);

export default Home;
