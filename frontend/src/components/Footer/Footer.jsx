import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">

      <div className="footer-top">

        <img
          src={assets.logo}
          alt="Campus Bites"
          className="footer-logo"
        />

        <h2>Campus Bites</h2>

        <p>
          Fresh food, quick delivery and a better
          campus dining experience.
        </p>

      </div>

      <div className="footer-contact">

        <div className="contact-card">
          📧 bitescampus27@gmail.com
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Campus Bites
      </div>

    </div>
  );
};

export default Footer;