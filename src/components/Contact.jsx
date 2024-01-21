import React, { Suspense } from 'react';
import './css/contact.css';
import Header from './Header';
import Bounce from 'react-reveal';
import { Canvas } from 'react-three-fiber';
import Boxer from './Models/Boxer';

function Contact() {
  return (
    <Bounce down>
      <div className="container-form">
        {' '}
        <Header />
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
