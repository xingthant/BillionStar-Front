import React from 'react';
import '../styles/Contact.css';

const Contact = () => {
  // Replace with your actual coordinates
  const latitude = 16.8409;
  const longitude = 96.1735;
  const locationName = "Shwekokko, Myanmar";
  const address = "ရွေကုက္ကို ရထိုက်၀င်း ( တရုတ်ဆိုဒ် )";

  const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30552.364790871692!2d98.50590663433101!3d16.8240938240608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30dda1299cb95969%3A0xc33a3821c61409ee!2sShwekokko%2C%20Myanmar%20(Burma)!5e0!3m2!1sen!2sth!4v1756661730868!5m2!1sen!2sth" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade`;
  
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1 className="contact-title">Contact Us</h1>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>ယခုပဲဆက်သွယ်လိုက်ပါ။</h2>
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>xerlokxerlok322@gmail.com</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <h3>Phone</h3>
                <p>+95 09695351159 (Myanmar)</p>
                <p>+95 09674412706 (Myanmar)</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📢</div>
              <div>
                <h3>Telegram</h3>
                <div className="telegram-links">
                  <a href='https://t.me/billionaire999999999' target='_blank' rel='noopener noreferrer'>
                    📢 Telegram Channel
                  </a>
                  <a href='https://t.me/leonor2120' target='_blank' rel='noopener noreferrer'>
                    👤 Telegram Owner
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="google-maps-section">
          <div className="maps-header">
            <h2>Our Location</h2>
            <p>Come visit us at our store</p>
          </div>

          <div className="map-container">
            <iframe
              src={googleMapsUrl}
              className="map-iframe"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            >
              {/* Fallback content if iframe doesn't load */}
              <div className="map-placeholder">
                <div className="map-placeholder-icon">🗺️</div>
                <p>Google Maps couldn't load. Please check your connection.</p>
              </div>
            </iframe>
          </div>

          <div className="location-details">
            <h4>📍 {locationName}</h4>
            <p>{address}</p>
          </div>

          <div className="map-actions">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="get-directions-btn"
            >
              🗺️ Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;