import React, { useState } from 'react';
import { Card, Button } from 'flowbite-react';
import Navbar from '../components/navbar';

const pricingPlans = [
  {
    name: 'Basic Plan',
    price: '$19/month',
    features: [
      '10 Interview Sessions per Month',
      'Basic Feedback on Performance',
      'Access to Standard Question Bank',
      'Email Support',
    ],
    bgClass: 'bg-blue-500',
  },
  {
    name: 'Pro Plan',
    price: '$49/month',
    features: [
      '50 Interview Sessions per Month',
      'Detailed Feedback and Analytics',
      'Access to Advanced Question Bank',
      'Mock Interviews with Industry Experts',
      'Priority Email Support',
    ],
    bgClass: 'bg-purple-500',
  },
  {
    name: 'Enterprise Plan',
    price: '$99/month',
    features: [
      'Unlimited Interview Sessions',
      'Comprehensive Feedback and Personalized Coaching',
      'Access to Complete Question Bank',
      'Mock Interviews with Industry Leaders',
      '24/7 Support',
      'Team Management Features',
    ],
    bgClass: 'bg-pink-500',
  },
];

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  return (
    <div className="bg-gradient-to-b from-white via-blue-100 to-white min-h-screen">
      <Navbar/>
      <div className="text-center my-16">
        <h1 className="text-4xl font-bold mb-4">Our Pricing Plans</h1>
        <p className="text-lg text-gray-600">
          Choose a plan that fits your needs. All plans come with a 14-day free trial.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`w-full max-w-sm p-6 rounded-lg shadow-md ${plan.bgClass} text-white relative`}
          >
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-xl font-semibold mb-4">{plan.price}</p>
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="absolute bottom-0 left-0 w-full p-4">
              <button
                className={`bg-white hover:bg-opacity-30 border border-spacing-2 text-gray-900 text-opacity-100 font-bold py-2 px-4 rounded w-full ${
                  selectedPlan === plan ? 'text-grey-900' : ''
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                {selectedPlan === plan ? 'Selected' : 'Choose Plan'}
              </button>
            </div>
          </Card>
        ))}
      </div>
      {selectedPlan && (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">You have selected:</h2>
          <p className="text-xl font-semibold mb-4">{selectedPlan.name}</p>
          <p className="text-lg text-gray-600">{selectedPlan.price}</p>
        </div>
      )}
    </div>
  );
};

export default Pricing;