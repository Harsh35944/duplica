      import React, { useEffect, useState } from 'react';

      const GoogleAds = ({ adSlot, adFormat = 'auto', style = {} }) => {
      const [isSubscribed, setIsSubscribed] = useState(null);

      useEffect(() => {
      // Check if user is subscribed
      const checkSubscription = async () => {
            try {
              // Dummy simulation for testing
              const simulateDummy = true;
              if (simulateDummy) {
                setIsSubscribed(false); // Simulate stripeCustomerId is null
                return;
              }
          
              const token = localStorage.getItem('token');
              if (!token) {
                setIsSubscribed(false);
                return;
              }
          
              const response = await fetch('http://localhost:3001/auth/getUser', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
          
              const data = await response.json();
              setIsSubscribed(data?.stripeCustomerId !== null);
            } catch (error) {
              console.error('Error checking subscription:', error);
              setIsSubscribed(false);
            }
          };
          

      checkSubscription();
      }, []);

      useEffect(() => {
      // Load Google Ads script
      const loadGoogleAds = () => {
            try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
            console.error('Error loading Google Ads:', err);
            }
      };

      // Only load ads if user is not subscribed
      if (!isSubscribed) {
            loadGoogleAds();
      }
      }, [isSubscribed]);

      // Don't render ads for subscribed users
      if (isSubscribed) {
      return null;
      }

      return (
      <div style={style}>
            <ins className="adsbygoogle"
     style={{ display: 'block' }}
     data-ad-client="ca-pub-5376507826502015"
     data-ad-slot="1831284933"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

      </div>
      );
      };

      export default GoogleAds; 
