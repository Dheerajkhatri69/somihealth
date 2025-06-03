import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const WeightLossMedicationSegment = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Weight Loss Medication History</h3>
            <div className="space-y-1.5">
                <Label htmlFor="weightLossMeds12m" className="text-gray-700">Weight Loss Medication (Last 12 Months)</Label>
                <Textarea
                    id="weightLossMeds12m"
                    name="weightLossMeds12m"
                    value={formData.weightLossMeds12m}
                    onChange={handleInputChange}
                    placeholder="List any weight loss medications taken in the past 12 months..."
                    className="focus-visible:ring-primary"
                />
            </div>
        </div>
    );
};
