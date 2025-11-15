import CallUsSection from '@/components/GeneralHealth/mainPage/CallUsSection';
import HowWeHelp from '@/components/GeneralHealth/mainPage/HowWeHelp';
import InPersonRequired from '@/components/GeneralHealth/mainPage/InPersonRequired';
import Steps from '@/components/GeneralHealth/mainPage/steps';
import SymptomsWeTreat from '@/components/GeneralHealth/mainPage/SymptomsWeTreat';
import TelehealthHero from '@/components/GeneralHealth/mainPage/TelehealthHero';
import TreatmentsRisks from '@/components/GeneralHealth/mainPage/TreatmentsRisks';
import Navbar from '@/components/hero/Navbar';
import SomiFooter from '@/components/hero/SomiFooter';
import React from 'react'

const page = () => {
    return (
        <>
            <Navbar />
            <main>
                <TelehealthHero />
                <HowWeHelp />
                <Steps />
                <SymptomsWeTreat />
                <InPersonRequired />
                <TreatmentsRisks />
                <CallUsSection />
            </main>


            <SomiFooter />
        </>
    );
}

export default page