import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

// Add error handling for Stripe initialization
const stripePromise = (() => {
  const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
  if (!stripePublicKey) {
    console.error('Stripe public key is not configured. Please check your .env file.');
    return null;
  }
  console.log('Stripe public key loaded:', stripePublicKey);
  return loadStripe(stripePublicKey);
})();

const getDefaultPlans = () => [
  {
    icon: "✨",
    title: "Free Plan",
    price: "$0",
    period: "/ Month",
    features: ["Free Forever", "Limited Duplica Models"],
    button: "Current Plan",
    gradient: "",
    priceId: null,
  },
  {
    icon: "🔥",
    title: "Basic Plan",
    price: "Loading...",
    period: "/ Month",
    features: ["Up to 30 Duplica Models", "100 Generations Credits Per Month"],
    button: "Get Basic",
    gradient: "from-yellow-400 to-orange-400",
    priceId: null,
  },
  {
    icon: "🚀",
    title: "Unlimited Plan",
    price: "Loading...",
    period: "/ Month",
    features: ["Unlimited Duplica Models", "Unlimited Image Generations"],
    button: "Get Unlimited",
    gradient: "from-yellow-400 to-orange-400",
    priceId: null,
  },
];

export default function UpgradePlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [plans, setPlans] = useState(getDefaultPlans());

  useEffect(() => {
    fetchCurrentSubscription();
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      console.log('Fetching subscription prices...');
      const response = await axios.get('https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/subscription/prices');
      console.log('Prices response:', response.data);

      setPlans(prevPlans => {
        const newPlans = [...prevPlans];
        
        // Update Basic plan
        newPlans[1] = {
          ...newPlans[1],
          price: `$${response.data.basic.amount}`,
          period: `/${response.data.basic.interval}`,
          priceId: response.data.basic.id,
        };

        // Update Unlimited plan
        newPlans[2] = {
          ...newPlans[2],
          price: `$${response.data.unlimited.amount}`,
          period: `/${response.data.unlimited.interval}`,
          priceId: response.data.unlimited.id,
        };

        return newPlans;
      });
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Failed to load subscription prices');
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching subscription status...');
      const response = await axios.get('https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/subscription/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Subscription status response:', response.data);
      setSubscriptionStatus(response.data);
      setCurrentPlan(response.data?.plan || 'free');
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err.response?.data?.message || 'Failed to load subscription status');
    }
  };

  const handleSubscribe = async (priceId) => {
    if (!priceId) {
      console.log('No price ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      if (!stripePromise) {
        console.error('Stripe is not initialized');
        setError('Stripe is not properly configured. Please contact support.');
        return;
      }

      console.log('Creating checkout session for price ID:', priceId);
      const response = await axios.post(
        'https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/subscription/create-checkout-session',
        { priceId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Checkout session created:', response.data);

      const stripe = await stripePromise;
      console.log('Redirecting to Stripe Checkout...');
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        setError(error.message);
      }
    } catch (err) {
      console.error('Error in handleSubscribe:', err);
      setError(err.response?.data?.message || 'Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = (plan) => {
    if (loading) return "Loading...";
    if (currentPlan === plan.title.toLowerCase()) return "Current Plan";
    if (subscriptionStatus?.status === 'active' && plan.title.toLowerCase() === 'free') {
      return "Downgrade";
    }
    return plan.button;
  };

  const isButtonDisabled = (plan) => {
    if (loading) return true;
    if (currentPlan === plan.title.toLowerCase()) return true;
    if (subscriptionStatus?.status === 'active' && plan.title.toLowerCase() === 'free') {
      return false; // Allow downgrading to free plan
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
      {error && (
        <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center items-center">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className="flex-1 bg-black/80 border border-yellow-400 rounded-2xl p-8 flex flex-col items-center min-w-[300px] max-w-sm shadow-lg"
            style={{ minHeight: 420 }}
          >
            <div className="text-3xl mb-2">
              {plan.icon}{" "}
              <span className="text-yellow-400 font-bold text-2xl">
                {plan.title}
              </span>
            </div>
            <div className="w-full bg-gradient-to-b from-yellow-900/20 to-transparent rounded-xl p-6 flex flex-col items-center mb-6 mt-2">
              <div className="text-white text-4xl font-bold mb-2">
                {plan.price}{" "}
                <span className="text-lg font-normal">{plan.period}</span>
              </div>
              <div className="w-full border-b border-gray-700 mb-4"></div>
              <ul className="w-full mb-4">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center text-green-400 mb-2 text-lg"
                  >
                    <span className="mr-2">✅</span>{" "}
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              disabled={isButtonDisabled(plan)}
              onClick={() => handleSubscribe(plan.priceId)}
              className={`w-full py-3 rounded-lg font-bold mt-auto ${
                plan.gradient
                  ? `bg-gradient-to-r ${plan.gradient} text-black`
                  : "bg-black/80 text-yellow-400 border border-yellow-400"
              } hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getButtonText(plan)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 






// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { loadStripe } from "@stripe/stripe-js";
// import GoogleAds from '../components/GoogleAds';

// // Add error handling for Stripe initialization
// const stripePromise = (() => {
//   const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
//   if (!stripePublicKey) {
//     console.error('Stripe public key is not configured. Please check your .env file.');
//     return null;
//   }
//   console.log('Stripe public key loaded:', stripePublicKey);
//   return loadStripe(stripePublicKey);
// })();

// const getDefaultPlans = () => [
//   {
//     icon: "✨",
//     title: "Free Plan",
//     price: "$0",
//     period: "/ Month",
//     features: ["Free Forever", "Limited Duplica Models"],
//     button: "Current Plan",
//     gradient: "",
//     priceId: null,
//   },
//   {
//     icon: "🔥",
//     title: "Basic Plan",
//     price: "Loading...",
//     period: "/ Month",
//     features: ["Up to 30 Duplica Models", "100 Generations Credits Per Month"],
//     button: "Get Basic",
//     gradient: "from-yellow-400 to-orange-400",
//     priceId: null,
//   },
//   {
//     icon: "🚀",
//     title: "Unlimited Plan",
//     price: "Loading...",
//     period: "/ Month",
//     features: ["Unlimited Duplica Models", "Unlimited Image Generations"],
//     button: "Get Unlimited",
//     gradient: "from-yellow-400 to-orange-400",
//     priceId: null,
//   },
// ];

// export default function UpgradePlan() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [currentPlan, setCurrentPlan] = useState(null);
//   const [error, setError] = useState(null);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [plans, setPlans] = useState(getDefaultPlans());

//   useEffect(() => {
//     fetchCurrentSubscription();
//     fetchPrices();
//   }, []);

//   const fetchPrices = async () => {
//     try {
//       console.log('Fetching subscription prices...');
//       const response = await axios.get('http://localhost:3001/subscription/prices');
//       console.log('Prices response:', response.data);

//       setPlans(prevPlans => {
//         const newPlans = [...prevPlans];
        
//         // Update Basic plan
//         newPlans[1] = {
//           ...newPlans[1],
//           price: `$${response.data.basic.amount}`,
//           period: `/${response.data.basic.interval}`,
//           priceId: response.data.basic.id,
//         };

//         // Update Unlimited plan
//         newPlans[2] = {
//           ...newPlans[2],
//           price: `$${response.data.unlimited.amount}`,
//           period: `/${response.data.unlimited.interval}`,
//           priceId: response.data.unlimited.id,
//         };

//         return newPlans;
//       });
//     } catch (err) {
//       console.error('Error fetching prices:', err);
//       setError('Failed to load subscription prices');
//     }
//   };

//   const fetchCurrentSubscription = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.log('No token found, redirecting to login');
//         navigate('/login');
//         return;
//       }

//       console.log('Fetching subscription status...');
//       const response = await axios.get('http://localhost:3001/subscription/status', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       console.log('Subscription status response:', response.data);
//       setSubscriptionStatus(response.data);
//       setCurrentPlan(response.data?.plan || 'free');
//     } catch (err) {
//       console.error('Error fetching subscription:', err);
//       setError(err.response?.data?.message || 'Failed to load subscription status');
//     }
//   };

//   const handleSubscribe = async (priceId) => {
//     if (!priceId) {
//       console.log('No price ID provided');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.log('No token found, redirecting to login');
//         navigate('/login');
//         return;
//       }

//       if (!stripePromise) {
//         console.error('Stripe is not initialized');
//         setError('Stripe is not properly configured. Please contact support.');
//         return;
//       }

//       console.log('Creating checkout session for price ID:', priceId);
//       const response = await axios.post(
//         'http://localhost:3001/subscription/create-checkout-session',
//         { priceId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       console.log('Checkout session created:', response.data);

//       const stripe = await stripePromise;
//       console.log('Redirecting to Stripe Checkout...');
//       const { error } = await stripe.redirectToCheckout({
//         sessionId: response.data.sessionId,
//       });

//       if (error) {
//         console.error('Stripe redirect error:', error);
//         setError(error.message);
//       }
//     } catch (err) {
//       console.error('Error in handleSubscribe:', err);
//       setError(err.response?.data?.message || 'Failed to start subscription process');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getButtonText = (plan) => {
//     if (loading) return "Loading...";
//     if (currentPlan === plan.title.toLowerCase()) return "Current Plan";
//     if (subscriptionStatus?.status === 'active' && plan.title.toLowerCase() === 'free') {
//       return "Downgrade";
//     }
//     return plan.button;
//   };

//   const isButtonDisabled = (plan) => {
//     if (loading) return true;
//     if (currentPlan === plan.title.toLowerCase()) return true;
//     if (subscriptionStatus?.status === 'active' && plan.title.toLowerCase() === 'free') {
//       return false; // Allow downgrading to free plan
//     }
//     return false;
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
//       {error && (
//         <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
//           {error}
//         </div>
//       )}

//       {/* Top Ad */}
//       <div className="w-full max-w-6xl mb-8">
//         <GoogleAds 
//           adSlot="YOUR_AD_SLOT_ID_1" 
//           style={{ minHeight: '90px' }}
//         />
//       </div>

//       <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center items-center">
//         {plans.map((plan) => (
//           <div
//             key={plan.title}
//             className="flex-1 bg-black/80 border border-yellow-400 rounded-2xl p-8 flex flex-col items-center min-w-[300px] max-w-sm shadow-lg"
//             style={{ minHeight: 420 }}
//           >
//             <div className="text-3xl mb-2">
//               {plan.icon}{" "}
//               <span className="text-yellow-400 font-bold text-2xl">
//                 {plan.title}
//               </span>
//             </div>
//             <div className="w-full bg-gradient-to-b from-yellow-900/20 to-transparent rounded-xl p-6 flex flex-col items-center mb-6 mt-2">
//               <div className="text-white text-4xl font-bold mb-2">
//                 {plan.price}{" "}
//                 <span className="text-lg font-normal">{plan.period}</span>
//               </div>
//               <div className="w-full border-b border-gray-700 mb-4"></div>
//               <ul className="w-full mb-4">
//                 {plan.features.map((feature, i) => (
//                   <li
//                     key={i}
//                     className="flex items-center text-green-400 mb-2 text-lg"
//                   >
//                     <span className="mr-2">✅</span>{" "}
//                     <span className="text-white">{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <button
//               disabled={isButtonDisabled(plan)}
//               onClick={() => handleSubscribe(plan.priceId)}
//               className={`w-full py-3 rounded-lg font-bold mt-auto ${
//                 plan.gradient
//                   ? `bg-gradient-to-r ${plan.gradient} text-black`
//                   : "bg-black/80 text-yellow-400 border border-yellow-400"
//               } hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed`}
//             >
//               {getButtonText(plan)}
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Bottom Ad */}
//       <div className="w-full max-w-6xl mt-8">
//         <GoogleAds 
//           adSlot="YOUR_AD_SLOT_ID_2" 
//           style={{ minHeight: '90px' }}
//         />
//       </div>
//     </div>
//   );
// } 
