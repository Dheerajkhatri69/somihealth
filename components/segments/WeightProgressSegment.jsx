import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const WeightProgressSegment = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Weight Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['startingWeight', 'currentWeight', 'goalWeight', 'weightChange12m'].map((field) => (
                    <div key={field} className="space-y-1.5">
                        <Label htmlFor={field} className="text-gray-700">
                            {field === 'startingWeight' ? 'Starting Weight (lbs)' :
                                field === 'currentWeight' ? 'Current Weight (lbs)' :
                                    field === 'goalWeight' ? 'Goal Weight (lbs)' :
                                        '12-Month Weight Change (lbs)'}
                        </Label>
                        <Input
                            id={field}
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                            placeholder={
                                field === 'startingWeight' ? 'e.g. 240' :
                                    field === 'currentWeight' ? 'e.g. 214' :
                                        field === 'goalWeight' ? 'e.g. 180' : 'e.g. -26, +10, etc.'
                            }
                            className="focus-visible:ring-primary"
                        />
                    </div>
                ))}
            </div>
            <div className="space-y-1.5 mt-4">
                <Label htmlFor="weightLossPrograms" className="text-gray-700">Weight Loss Programs</Label>
                <Textarea
                    id="weightLossPrograms"
                    name="weightLossPrograms"
                    value={formData.weightLossPrograms}
                    onChange={handleInputChange}
                    placeholder="List any previous or current weight loss programs..."
                    className="focus-visible:ring-primary"
                />
            </div>
        </div>
    );
};
