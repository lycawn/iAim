import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import Header from './Header';
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from 'react-three-fiber';
import Tokyo from './Models/Tokyo';
import { Sky } from './Models/Sky';
import './css/portfolio.css';
import { experience, skills } from './costants/constant';
function Portfolio() {
  const [currentStage, setCurrentStage] = useState(null);
  // rotating boolean
  const [isRotating, setIsRotating] = useState(false);
  // Mobile - pc adjustments
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [0.2, 0.2, 0.2];
      screenPosition = [11, -50.5, 493.4];
    } else {
      screenScale = [1.1, 1.1, 1.1];
      screenPosition = [-51, -200.5, -75.4];
    }

    return [screenScale, screenPosition, currentStage];
  };
  const [islandScale, islandPosition] = adjustIslandForScreenSize();
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'ArrowRight') {
        // Scroll down logic
        // You can use the ref or any other method to scroll down
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      } else if (event.key === 'ArrowLeft') {
        // Scroll up logic
        // You can use the ref or any other method to scroll up
        window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
      }
    };

    // Attach the event listener when the component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Detach the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <section>
      <Header />{' '}
      <section className="Tokyo">
        <Suspense>
          <Canvas>
            <directionalLight position={[1, 1, 1]} intensity={2} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 5, 10]} intensity={0} />
            <spotLight
              position={[0, 0, 0]}
              angle={0.15}
              penumbra={10}
              intensity={3}
            />
            <hemisphereLight
              skyColor="#b1e1ff"
              groundColor="#0A1D56"
              intensity={0.5}
            />

            <Tokyo
              isRotating={isRotating}
              setIsRotating={setIsRotating}
              setCurrentStage={setCurrentStage}
              position={islandPosition}
              rotation={[-0.09, -1.0, -6.3]}
              scale={islandScale}
            />
          </Canvas>
        </Suspense>
      </section>
      <div className="welcoming">
        <h1 className="web-developer">Angelos Antoniades</h1>
        <p className="web-developer-under">
          {' '}
          <h1 className="rotate">
            <img src="./img/arrows.png" width="70px" height="70px" /> <br></br>
            (use Arrow keys) <br></br>{' '}
          </h1>{' '}
          <span className="web-developer-span">Developer</span>
          Web & Game
        </p>
      </div>
      <div className="skills-container">
        <div className="skill-items"></div>
        <div className="skill-items">
          {skills.map(skills => (
            <img className="imgSkills" src={skills.img} />
          ))}
        </div>
      </div>{' '}
      <br></br>
      <br></br> <br></br>{' '}
      <VerticalTimeline className="vertical-time-line">
        {experience.map(experience => (
          <VerticalTimelineElement
            key={experience.name_company}
            date={experience.date}
            icon={
              <div className="image-space">
                <img src={experience.imgUrl} className="imgWork" />
              </div>
            }
          >
            {' '}
            <div className="element-css">
              <h3 className="job-title">{experience.title}</h3>
              <p className="name-company">{experience.name_company}</p>
              <div className="job-info">
                <p>{experience.info}</p>
              </div>{' '}
            </div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </section>
  );
}
export default Portfolio;
