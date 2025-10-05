import BMICalculator from '@/components/hero/BMICalculator'
import CompoundedExplainer from '@/components/hero/compounded-glp1'
import HowItWorksGnz from '@/components/hero/HowItworks'
import Navbar from '@/components/hero/Navbar'
import SomiFooter from '@/components/hero/SomiFooter'
import Faq from "@/components/hero/Faq";
import React from 'react'

const BMICalculatorPage = () => {
    return (
        <main >
            <Navbar />
            <BMICalculator />
            <CompoundedExplainer />
            <HowItWorksGnz />
            <Faq />
            <SomiFooter />
        </main>
    )
}

export default BMICalculatorPage