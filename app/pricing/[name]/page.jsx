'use client'
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ContactInfoTooltip from '@/components/ContactInfoTooltip';

const PRODUCTS = {
  semaglutide: {
    name: 'Semaglutide',
    image: '/pricing/semaglutide.png',
    options: [
      {
        label: '4 weeks (0.25mg/week)',
        price: '$99',//done
        link: 'https://buy.stripe.com/aFa00kgdE46kd640Eg3ks02',
      },
      {
        label: '8 Weeks (0.25mg and 0.5mg/week)',
        price: '$279',//done
        link: 'https://buy.stripe.com/dRmeVee5w32gaXW4Uw3ks03',
      },
      {
        label: '12 Weeks (0.25mg, 0.5mg, 1mg/week)',
        price: '$329',//done
        link: 'https://buy.stripe.com/dRm6oI2mO8mAc203Qs3ks05',
      },
      {
        label: '4 Weeks (0.5mg/week)',
        price: '$190',//done
        link: 'https://buy.stripe.com/fZu7sM1iK46k5DCbiU3ks0k',
      },
      {
        label: '8 Weeks (0.5mg/week)',
        price: '$249',//done
        link: 'https://buy.stripe.com/8x27sM5z046k6HG86I3ks0l',
      },
      {
        label: '13 Weeks (0.5mg/week)',
        price: '$329',//done
        link: 'https://buy.stripe.com/14AaEY3qS8mAc20aeQ3ks0L',
      },
      {
        label: '4 Weeks (1mg/week)',
        price: '$249',//done
        link: 'https://buy.stripe.com/aFafZi5z00U8fec1Ik3ks06',
      },
      {
        label: '10 Weeks (1mg/week)',
        price: '$369',//done
        link: 'https://buy.stripe.com/aFaeVe1iK5ao3vu72E3ks0S',
      },
      {
        label: '4 Weeks (1.7mg/Week)',
        price: '$329',//done
        link: 'https://buy.stripe.com/14AeVe8LcauI5DC3Qs3ks0M',
      },
      {
        label: '12 Weeks (1.7mg/week)',
        price: '$474',//done
        link: 'https://buy.stripe.com/6oUfZif9A8mA8POdr23ks0N',
      },
      {
        label: '5 Weeks (2mg/Week)',
        price: '$329',//done
        link: 'https://buy.stripe.com/8x214o0eGcCQd64gDe3ks0O',
      },
      {
        label: '10 Weeks (2mg/week)',
        price: '$474',//done
        link: 'https://buy.stripe.com/9B6aEY9Pg0U83vuaeQ3ks0Q',
      },
      {
        label: '4 Weeks (2.5mg/week)',
        price: '$329',//done
        link: 'https://buy.stripe.com/cNi00k3qSgT60jibiU3ks0P',
      },
      {
        label: '8 Weeks (2.5mg/week)',
        price: '$474',//done
        link: 'https://buy.stripe.com/14A8wQ8Lc46kd6472E3ks0R',
      },
    ],
  },
  tirzepatide: {
    name: 'Tirzepatide',
    image: '/pricing/tirzepatide.png',
    options: [
      {
        label: '4 weeks (2.5mg/week)',
        price: '$145',//done
        link: 'https://buy.stripe.com/9B67sM0eG5ao5DCfza3ks0e',
      },
      {
        label: '8 Weeks (2.5mg and 5mg/week)',
        price: '$379',//done
        link: 'https://buy.stripe.com/eVqfZi5z08mA5DCev63ks0F',
      },
      {
        label: '12 Weeks (2.5mg, 5mg, 7.5mg/week)',
        price: '$559',//done
        link: 'https://buy.stripe.com/00w9AU1iK0U88PO3Qs3ks0g',
      },
      {
        label: '4 Weeks (5mg/Week)',
        price: '$299',//done
        link: 'https://buy.stripe.com/fZu5kE4uW0U8c20dr23ks0h',
      },
      {
        label: '8 Weeks (5mg/Week)',
        price: '$399',//done
        link: 'https://buy.stripe.com/3cI7sM7H846kaXWbiU3ks0i',
      },
      {
        label: '12 Weeks (5mg/Week)',
        price: '$559',//done
        link: 'https://buy.stripe.com/5kQbJ28LccCQgigbiU3ks0G',
      },
      {
        label: '4 Weeks (7.5mg/Week)',
        price: '$359',//done
        link: 'https://buy.stripe.com/eVqdRa6D4byM0jiev63ks0t',
      },
      {
        label: '8 Weeks (7.5mg/Week)',
        price: '$559',//done
        link: 'https://buy.stripe.com/aFafZi3qSeKY8PO86I3ks0H',
      },
      {
        label: '4 Weeks (10mg/week)',
        price: '$399',//done
        link: 'https://buy.stripe.com/9B63cw3qS5aoea85YA3ks0o',
      },
      {
        label: '6 Weeks (10mg/week)',
        price: '$559',//done
        link: 'https://buy.stripe.com/14AaEY8LcdGUd64biU3ks0K',
      },
      {
        label: '4 Weeks (12.5mg/week)',
        price: '$469',//done
        link: 'https://buy.stripe.com/bJe28s7H87iw7LK0Eg3ks0I',
      },
      {
        label: '4 Weeks (15mg/Week)',
        price: '$559',
        link: 'https://buy.stripe.com/5kQ00k4uWdGU3vu9aM3ks0J',
      },
    ],
  },
};

const INITIAL_SUMMARY = {
  product: '',
  reviewFee: 25,
  price: '',
  quantity: 1,
  label: '',
  link: '',
};

const Page = ({ params }) => {
  const name = params.name?.toLowerCase();
  const product = PRODUCTS[name];
  const [selected, setSelected] = useState(null);
  const summaryRef = useRef(null);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-secondary">Product not found</div>
    );
  }

  const summary = selected
    ? {
      product: product.name,
      reviewFee: 25,
      totle: `$${parseFloat(selected.price.replace('$', '')) + 25}`,
      price: selected.price,
      quantity: 1,
      label: selected.label,
      link: selected.link,
    }
    : INITIAL_SUMMARY;

  const handleOptionClick = (opt) => {
    setSelected(opt);
    if (typeof window !== 'undefined' && window.innerWidth < 768 && summaryRef.current) {
      setTimeout(() => {
        summaryRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100); // slight delay to ensure state update
    }
  };

  const handleCheckout = () => {
    if (summary.link) {
      window.open(summary.link, '_blank');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
      <Link href="/pricing" >
        <h1 className="font-tagesschrift text-5xl md:text-7xl text-secondary font-bold mb-2 text-center">somi</h1>
      </Link>
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* Product Card */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 flex flex-col items-center mb-4 md:mb-0">
          <div className='w-full flex items-start justify-between'>
            <Link href="/pricing" >
              <div className='flex text-xs items-center hover:underline text-secondary cursor-pointer'><ChevronLeft size={18} />Back</div>
            </Link>
            <ContactInfoTooltip />
          </div>

          <div className="relative w-36 h-36 md:w-[180px] md:h-[180px] mb-4">
            <Image src={product.image} alt={product.name} fill className="object-contain rounded-xl" priority />
          </div>
          <h2 className="text-secondary text-xl font-bold mb-4">Compounded {product.name}</h2>
          {/* <h3 className="text-gray-700 font-semibold mb-4">Starter Dose/Price</h3> */}
          <ul className="w-full space-y-2">
            {product.options.map((opt, idx) => (
              <li
                key={idx}
                className={`flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer
                  ${selected === opt ? 'bg-blue-100 border-secondary shadow' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}
                `}
                onClick={() => handleOptionClick(opt)}
              >
                <span className="text-secondary font-medium text-sm md:text-base">{opt.label}</span>
                <span className="text-secondary font-bold text-base mt-1 md:mt-0">{opt.price}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Summary Card */}
        <div
          ref={summaryRef}
          className="w-full md:w-1/2 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 flex flex-col justify-between min-w-[280px] max-w-md mx-auto"
        >
          <h3 className="text-secondary text-lg font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Product Name</span>
              <span className="font-bold text-secondary">{summary.product || '--'}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Selected Option</span>
              <span className="font-bold text-right text-secondary">{summary.label || '--'}</span>
            </div>
            {/* <div className="flex justify-between text-gray-700 font-medium">
              <span>Product Price</span>
              <span className="font-bold text-secondary">{summary.price || '--'}</span>
            </div> */}
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Quantity</span>
              <span className="font-bold text-secondary">{summary.quantity}</span>
            </div>
            {/* <hr /> */}
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-secondary">{summary.price || '--'}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span className='flex gap-2 items-center'>
                Clinician Review Fee
                <div className="relative inline-flex group">
                  <Info size={20} className="cursor-pointer" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block w-72 p-3 mb-2 text-sm bg-white rounded shadow-lg border border-gray-200">
                    Our $25 Clinician review fee is required for our licensed clinicians to review your health intake form for approval in 24 hours, and also to develop personalized plans that fit your wellness and weight loss goals.
                    <svg className="absolute text-white h-2 left-1/2 top-full -translate-x-1/2" x="0px" y="0px" viewBox="0 0 255 255">
                      <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                    </svg>
                  </div>
                </div>
              </span>
              <span className="font-bold text-secondary">${summary.reviewFee}</span>
            </div>

            <div className="flex justify-between text-gray-700 font-medium">
              <span>Total Amount</span>
              <span className="font-bold text-secondary">{summary.totle || '--'}</span>
            </div>
            {/* <hr /> */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-md">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image
                    src="/pricing/like.png"
                    alt="Guaranteed"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <strong className="font-semibold">You&apos;re covered:</strong> We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy. 100% money back guarantee
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center mt-2">
            {[1, 2, 3, 6, 7, 8].map((num) => (
              <img
                key={num}
                src={`/pricing/${num}.png`}
                alt={`Payment method ${num}`}
                className="h-8 md:h-10 object-contain"
                loading="lazy"
              />
            ))}
          </div>
          <div className='flex justify-center gap-2 items-center'>
            <div className='mt-2 font-bold text-gray-600'>Financing Available</div>
            <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center mt-2">
              {[9, 10, 11].map((num) => (
                <img
                  key={num}
                  src={`/pricing/${num}.png`}
                  alt={`Payment method ${num}`}
                  className="h-6 md:h-8 object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          <div className="px-4 text-sm text-secondary font-bold text-center mt-4">
            FSA and HSA Accepted
          </div>

          <button
            className={`w-full mt-6 rounded-3xl py-4 font-bold text-base shadow transition
              ${summary.link ? 'bg-[#0031e3] text-white hover:bg-[#0031e3] cursor-pointer' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
            onClick={handleCheckout}
            disabled={!summary.link}
          >
            Checkout {summary.totle ? summary.totle : ''}
          </button>
          {/* <div className='flex items-center justify-center gap-4 mt-2 text-sm text-gray-600'>
            <hr className="w-full" /> or <hr className='w-full' />
          </div> */}
          <div className='text-sm text-gray-600 mt-6 p-2'>
            <strong>Note:</strong> Once payment has been made, please proceed with the 5-7 mins Intake Questionnaire.
            Get Approval within 24 hours
          </div>
          {/* <Link href="/getstarted" >
            <button
              className="w-full mt-4 rounded-3xl py-4 font-bold text-base shadow transition bg-green-400 hover:bg-green-300 text-white cursor-pointer">
              Begin Questionnaire
            </button>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Page;