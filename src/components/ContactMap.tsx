import React from 'react';
import { siteContent } from "@/config/site-content";

const ContactMap = () => {
  return (
    <div className="w-full">
      {/* Headline Section */}
      <div className="mb-8 text-right">        
        {/* Address */}
        <div className="text-gray-600 space-y-1">
          <p className="text-normal">{siteContent.brand.name}</p>
          <p className="text-normal">801 Barton Springs Road</p>
          <div className="flex items-center gap-2 justify-end">
            <p className="text-normal">Austin, TX 7870, United States</p>
            <span className="text-lg">🇺🇸</span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative">
        {/* Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none rounded-t-lg" />
        
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.8259098479373!2d-97.77557028488225!3d30.264197981790943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b509b76c4c47%3A0x1234567890abcdef!2s801%20Barton%20Springs%20Rd%2C%20Austin%2C%20TX%2078704%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus"
          className="w-full h-[360px] rounded-lg border border-gray-200 shadow-sm"
          style={{ filter: 'grayscale(20%)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Our Office Location"
        />
      </div>
    </div>
  );
};

export default ContactMap;