import React, { useState, Suspense } from 'react';
import './css/contact.css';
import Header from './Header';
import Bounce from 'react-reveal';
import Room from './Models/Room';
import { Canvas } from '@react-three/fiber';

function Contact() {
  const [currentStage, setCurrentStage] = useState(null);
  // rotating boolean
  const [isRotating, setIsRotating] = useState(false);
  // Mobile - pc adjustments
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [0.6, 0.6, 0.6];
      screenPosition = [12, -6.5, 493.4];
    } else {
      screenScale = [1.6, 1.6, 1.6];
      screenPosition = [0, -3.5, -35.4];
    }

    return [screenScale, screenPosition, currentStage];
  };
  const [islandScale, islandPosition] = adjustIslandForScreenSize();

  return (
    <Bounce down>
      <div className="container-form">
        {' '}
        <Header />
        <section className="Room">
          <Suspense>
            <Canvas>
              <directionalLight position={[1, 1, 1]} intensity={2} />
              <ambientLight intensity={0.5} />
              {/* <pointLight position={[10, 5, 10]} intensity={0} />
              <spotLight
                position={[0, 0, 0]}
                angle={0.15}
                penumbra={0}
                intensity={1}
              /> */}
              <hemisphereLight
                skyColor="#b1e1ff"
                groundColor="#99BC85"
                intensity={1}
              />

              <Room
                isRotating={isRotating}
                setIsRotating={setIsRotating}
                setCurrentStage={setCurrentStage}
                position={islandPosition}
                rotation={[0.87, -0.7077, 0]}
                scale={islandScale}
              />
            </Canvas>
          </Suspense>
        </section>
        <div className="header-form">
          <h1>Contact me</h1>
        </div>
        <div className="contact-form">
          <form
            target="_blank"
            action="https://formsubmit.co/aggelos.antoniades@outlook.com"
            method="POST"
          >
            <div className="form-group">
              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  className="inputs"
                  placeholder="Full Name"
                  required
                />

                <input
                  type="email"
                  name="email"
                  className="inputs"
                  placeholder="Email Address"
                  required
                />
              </div>
            </div>

            <textarea
              placeholder="Your Message"
              className="inputs-text"
              name="message"
              rows="20"
              required
            ></textarea>

            <input
              type="Submit"
              className="submit-input"
              value="Submit"
              placeholder="Contact"
            ></input>
          </form>
        </div>
      </div>
    </Bounce>
  );
}
export default Contact;
