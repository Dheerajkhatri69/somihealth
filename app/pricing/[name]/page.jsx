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
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-5e058e94ee8e4a2387b73ed36045ed4e60ec0ac35ca34e718fcde20d0f2001bc24ebf80a1ccd4f96ba91ae1495a38dbd?locale=EN_US',
      },
      {
        label: '8 Weeks (0.25mg and 0.5mg/week)',
        price: '$279',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-1ba9c8e303514285b2b43130b9935c5088b3a6949612404aa4bccf5e8edc3173a442c163001640c78d9e74d2114acd6e?locale=EN_US',
      },
      {
        label: '12 Weeks (0.25mg, 0.5mg, 1mg/week)',
        price: '$329',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-c43fe85069db4b6c92731eda4f53e683765f4bbde95b47678f3633e20a7bedb20866f78ab88e4785a285e8a0774f38c4?locale=EN_US',
      },
      {
        label: '4 Weeks (0.5mg/week)',
        price: '$190',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-9f7e44046a9a480aa227b5b3d5e2de6db5a15752dbc54e06879b3cb2093cd334ad325f14145a405fa994245099c97bf3?locale=EN_US',
      },
      {
        label: '8 Weeks (0.5mg/week)',
        price: '$249',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-160ac4a48a4f4b8a9f3a6458eb8061912e13f84beb8c4b32a51b649552d543d302794d6406704ecb83b9cc342057a935?locale=EN_US',
      },
      {
        label: '13 Weeks (0.5mg/week)',
        price: '$269',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-898cb427d8364771b4079eb135735e142e498620af0c4a78ad700697d4ee1ddd65625d3ee24a4ad8b95ad488e4d080f5?locale=EN_US',
      },
      {
        label: '4 Weeks (1mg/week)',
        price: '$249',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-1c5a3b2e50b24a2a9436c0efb8aba1697b3effa916914f4cbe882b51edcf126b41af32bef8c44b8bb3a3d1c9a3409c1e?locale=EN_US',
      },
      {
        label: '15 Weeks (1mg/week)',
        price: '$339',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-22534b2f956c4da79631a140d92d4785d7457f0834854368b6dfa0d1c51f8e25a0121ca9e6624ba1b552fa3dc41a4a86?locale=EN_US',
      },
      {
        label: '4 Weeks (1.7mg/Week)',
        price: '$269',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-c8d6be1fae0c4a71b2ff33603d85b6832476b889987a4e4886086928030d0c2709ebd46319cd489f8654539e2b191849?locale=EN_US',
      },
      {
        label: '12 Weeks (1.7mg/week)',
        price: '$379',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-f87d96a3ee32464c853ab02ade053556637274d14bca4b229cf4bd222cb010ba14eff5a20e0349e9a73c3ae54ed3cddc?locale=EN_US',
      },
      {
        label: '5 Weeks (2mg/Week)',
        price: '$299',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-48bdefbbeb18423d90952c7eb5c374d6722d2b9cc3384515be454fc9a744df7f91f57505fc30405fb185a056e20432f1?locale=EN_US',
      },
      {
        label: '12 Weeks (2mg/week)',
        price: '$399',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-59015916459d40e792c1e4c5328ffdee8cb3e6b12fba4cc88b960acb1e02f4b8c00652e402b648a28f5be774c176a624?locale=EN_US',
      },
      {
        label: '4 Weeks (2.5mg/week)',
        price: '$299',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-c9d8275ea51b44be8dd540a5dd2b2121f25ff6c8aa3f47d78ec9923b6efa36392356ff65f4c3422ab820c3e97ecd0812?locale=EN_US',
      },
      {
        label: '10 Weeks (2.5mg/week)',
        price: '$520',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-b577ae44e7954c96b94d8c0fdc3117f32445dc8091204758a059d7ae474229b907ab48b1a2de46d9be80fb6e1a8737e0?locale=EN_US',
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
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-0f601416e9174332ac03e6ecffc8279f9b1752a32c0b4f77a916c6ff7aba72268dfb1823c44e4af28be78c0b54aa0b28?locale=EN_US',
      },
      {
        label: '8 Weeks (2.5mg and 5mg/week)',
        price: '$359',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-c5423ed44586466192319dd8856314d7bfd8e39807cd4bf4b5cac95dbb1b53dd990ccbbdc3b64c70bca0980516181b0d?locale=EN_US',
      },
      {
        label: '12 Weeks (2.5mg, 5mg, 7.5mg/week)',
        price: '$559',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-65cdbeafae6047ae8ac74d8f18dcacb2f743fa585a5c45d1a4f58918651d8ef3d91ae5dbec8b43cdb24d2f6909b92acc?locale=EN_US',
      },
      {
        label: '4 Weeks (5mg/Week)',
        price: '$299',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-b66bb5ba00ba414c89478af89f518e10c2ca4e354e4b41658775e056cb940c7302567f109f47496fba84d7544beac123?locale=EN_US',
      },
      {
        label: '8 Weeks (5mg/Week)',
        price: '$399',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-520d081e60f34a96ba5b24e32e2a2ad359bd4b66bfcf4ce6b43e171d83462e03e9cc161163d44660823f59ead6304868?locale=EN_US',
      },
      {
        label: '12 Weeks (5mg/Week)',
        price: '$499',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-bdc3f38cf350485a9459091e13e739204a4d625b983d4c5982e1bbd0ce01a91b21f002c5a06c407e85657bd6f166a7e1?locale=EN_US',
      },
      {
        label: '4 Weeks (7.5mg/Week)',
        price: '$359',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-6a036e97c1404706ad91d31837575b6afb5cea32acc04cd1b6a924d6381147b6b1453fc10cdb41c8a91b91b37014160c?locale=EN_US',
      },
      {
        label: '8 Weeks (7.5mg/Week)',
        price: '$549',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-d7a60d8fcf5542fda4237aa81dce9465c704005f790448e1bf9e523c1ee3d07e0b628ffbba974e93b4402e4d1a9b808c?locale=EN_US',
      },
      {
        label: '4 Weeks (10mg/week)',
        price: '$399',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-ce1dfc6db1d8416da5b118aef82e67cda1520f36a93b41aaa8b7aab1038f564699405a4ba1b0476f88b19b006f7c45a7?locale=EN_US',
      },
      {
        label: '4 Weeks (12.5mg/week)',
        price: '$449',//done
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-a4f625ce10f44acebfee21a43e7c402fa40155641f2f46fdb869d19626a9fd74ea7303a812ae43ce8c3e1aa872d9f65d?locale=EN_US',
      },
      {
        label: '4 Weeks (15mg/Week)',
        price: '$499',
        link: 'https://connect.intuit.com/pay/SomiHealth/scs-v1-79726bd995614e25b932263de893d1bbd6b827c7f5934ebf82128c1ac411e17cd138e8d73b76409bbc9417fc85e83bce?locale=EN_US',
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