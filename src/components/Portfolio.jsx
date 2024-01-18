import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import Header from './Header';
import React from 'react';
import "./portfolio.css"
function Portfolio() {
  return (
    <section>
      <Header />
      <VerticalTimeline>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
          date="2022 - present"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
        >
          <h3 className="vertical-timeline-element-title">
            2nd Level Network & IPTV Technician
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
          <p>
            Technical Support about Internet network , IPTV , Voice Products.
          </p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2 - 2011"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
        >
          <h3 className="vertical-timeline-element-title">
            PORTFOLIO UNDER CONSTRUCTION
          </h3>
          <h4 className="vertical-timeline-element-subtitle">
            PORTFOLIO UNDER CONSTRUCTION
          </h4>
          <p>PORTFOLIO UNDER CONSTRUCTION</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2008 - 2010"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
        >
          <h3 className="vertical-timeline-element-title">
            PORTFOLIO UNDER CONSTRUCTION
          </h3>
          <h4 className="vertical-timeline-element-subtitle">
            PORTFOLIO UNDER CONSTRUCTION
          </h4>
          <p>PORTFOLIO UNDER CONSTRUCTION</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2006 - 2008"
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
        >
          <h3 className="vertical-timeline-element-title">Web Designer</h3>
          <h4 className="vertical-timeline-element-subtitle">
            San Francisco, CA
          </h4>
          <p>User Experience, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="April 2013"
          iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
        >
          <h3 className="vertical-timeline-element-title">
            Content Marketing for Web, Mobile and Social Media
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
          <p>Strategy, Social Media</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="November 2012"
          iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
        >
          <h3 className="vertical-timeline-element-title">
            Agile Development Scrum Master
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Certification</h4>
          <p>
            Pellentesque ante magna, laoreet ac gravida in, pretium sit amet
            metus. Duis quis dui tristique, malesuada nulla non, porttitor elit.
            Integer sed hendrerit elit. Sed maximus posuere enim non tempus.
            Pellentesque eget fermentum justo. Donec a ultrices eros. Proin dui
            sapien, rutrum sit amet ultrices convallis, aliquam eu nibh. Donec
            felis eros, luctus at nulla eu, elementum fermentum enim. Cras vitae
            tortor facilisis, pellentesque ex et, bibendum sapien. Vivamus
            bibendum quis eros quis lacinia. Cras faucibus, turpis ac dictum
            suscipit, purus tellus blandit arcu, sed varius eros nibh eu lectus.
            Duis non risus rutrum, aliquet turpis vitae, placerat enim.
            Curabitur id mi gravida, vulputate leo ac, pulvinar risus. Donec
            nisi ipsum, porttitor quis ultricies at, laoreet non dolor. Cras
            viverra ullamcorper pulvinar. Quisque iaculis tellus eget arcu
            accumsan iaculis. Nullam ac nibh id nisi hendrerit vulputate. Mauris
            in nunc dapibus, ornare nisi vel, ornare mauris. Cras tempus sapien
            nec mattis sagittis. Phasellus aliquam augue non lorem rutrum
            venenatis. Cras sollicitudin arcu vitae enim gravida varius.
            Suspendisse vitae consequat ante. Etiam tempor sit amet urna euismod
            varius. Suspendisse ultrices nec risus hendrerit feugiat.
          </p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="2002 - 2006"
          iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
        >
          <h3 className="vertical-timeline-element-title">
            Bachelor of Science in Interactive Digital Media Visual Imaging
          </h3>
          <h4 className="vertical-timeline-element-subtitle">
            Bachelor Degree
          </h4>
          <p>
            Pellentesque ante magna, laoreet ac gravida in, pretium sit amet
            metus. Duis quis dui tristique, malesuada nulla non, porttitor elit.
            Integer sed hendrerit elit. Sed maximus posuere enim non tempus.
            Pellentesque eget fermentum justo. Donec a ultrices eros. Proin dui
            sapien, rutrum sit amet ultrices convallis, aliquam eu nibh. Donec
            felis eros, luctus at nulla eu, elementum fermentum enim. Cras vitae
            tortor facilisis, pellentesque ex et, bibendum sapien. Vivamus
            bibendum quis eros quis lacinia. Cras faucibus, turpis ac dictum
            suscipit, purus tellus blandit arcu, sed varius eros nibh eu lectus.
            Duis non risus rutrum, aliquet turpis vitae, placerat enim.
            Curabitur id mi gravida, vulputate leo ac, pulvinar risus. Donec
            nisi ipsum, porttitor quis ultricies at, laoreet non dolor. Cras
            viverra ullamcorper pulvinar. Quisque iaculis tellus eget arcu
            accumsan iaculis. Nullam ac nibh id nisi hendrerit vulputate. Mauris
            in nunc dapibus, ornare nisi vel, ornare mauris. Cras tempus sapien
            nec mattis sagittis. Phasellus aliquam augue non lorem rutrum
            venenatis. Cras sollicitudin arcu vitae enim gravida varius.
            Suspendisse vitae consequat ante. Etiam tempor sit amet urna euismod
            varius. Suspendisse ultrices nec risus hendrerit feugiat.
          </p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          iconStyle={{ background: 'rgb(16, 204, 82)', color: '#fff' }}
        />
      </VerticalTimeline>{' '}
    </section>
  );
}
export default Portfolio;
