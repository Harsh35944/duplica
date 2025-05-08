      import React, { useEffect, useState } from 'react';

      const GoogleAds = ({ adSlot, adFormat = 'auto', style = {} }) => {
      const [isSubscribed, setIsSubscribed] = useState(false);

      useEffect(() => {
      // Check if user is subscribed
      const checkSubscription = async () => {
            try {
            const token = localStorage.getItem('token');
            if (!token) {
            setIsSubscribed(false);
            return;
            }

            const response = await fetch('http://localhost:3001/auth/getUsser', {
            headers: {
                  Authorization: `Bearer ${token}`
            }
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
            <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with your Google Ads publisher ID
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
            />
      </div>
      );
      };

      export default GoogleAds; 
