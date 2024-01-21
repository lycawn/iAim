import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import Header from './Header';
import React from 'react';
import './css/portfolio.css';
import { experience, skills } from './costants/constant';
function Portfolio() {
  return (
    <section>
      <Header />
      <div className="welcoming">
        <h1 className="web-developer">Angelos Antoniades</h1>
        <p className="web-developer-under">
          {' '}
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
      <br></br>
      <br></br>
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
