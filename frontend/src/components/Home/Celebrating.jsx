import React from "react";
import badgeImage from '../../assets/badge1.png';
import backgroundBadgeImage from '../../assets/badge2.png';
import './Celebrating.css';

function Celebrating() {
  
  const generateBokehCircles = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 15,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.6
    }));
  };

  const bokehCircles = generateBokehCircles(30);

  return (
    <div className="celebrating-container">
      <div className="celebrating-background-layer">
        <div className="celebrating-background-gradient"></div>
        
        {bokehCircles.map((circle) => (
          <div
            key={circle.id}
            className="celebrating-bokeh-circle"
            style={{
              '--size': `${circle.size}px`,
              '--left': `${circle.left}%`,
              '--top': `${circle.top}%`,
              '--delay': `${circle.delay}s`,
              '--duration': `${circle.duration}s`,
              '--opacity': circle.opacity * 0.3,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              left: `${circle.left}%`,
              top: `${circle.top}%`,
              animationDelay: `${circle.delay}s`,
              animationDuration: `${circle.duration}s`,
              opacity: circle.opacity * 0.3
            }}
          />
        ))}

        <div className="celebrating-background-badge">
          <div className="celebrating-background-badge-container">
            <img 
              src={backgroundBadgeImage}
              alt="10 Year Anniversary Badge Background"
              className="celebrating-background-badge-image"
            />
            <div className="celebrating-background-badge-glow"></div>
          </div>
        </div>
      </div>

      <div className="celebrating-main-content">
        <div className="celebrating-inner-container">
          <div className="celebrating-grid">
            
            <div className="celebrating-image-section">
              <div className="celebrating-image-container">
                <img 
                  src={badgeImage}
                  alt="Anniversary Badge"
                  className="celebrating-badge-image"
                />
                
                <div className="celebrating-image-glow"></div>
              </div>
            </div>

            <div className="celebrating-content-section">
              <div className="celebrating-heading-container">
                <h1 className="celebrating-main-heading">
                  A{" "}
                  <span>
                    DECADE 
                  </span>
                  <br />
                  <span>
                    OF SERVICE
                  </span>
                  <br />
                  <span>
                    EXCELLENCE
                  </span>
                </h1>
              </div>

              <div className="celebrating-text-content">
                <p>
                  For a decade, we've been dedicated to transforming the way businesses manage their people, 
                  streamlining workflows, simplifying payroll, and creating workplaces where teams thrive.
                </p>
                <p>
                  This milestone is more than just a number. It's a testament to the trust of our clients, 
                  the passion of our team, and the impact we've made together.
                </p>
                <p>
                  Here's to 10 years of innovation, commitment, and excellence and to many more years of 
                  helping businesses and people succeed.
                </p>
                <p>
                  <span className="celebrating-thank-you-text">
                    Thank you for being part of our journey.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Celebrating;