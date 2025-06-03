import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const GLP1Segment = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">GLP-1 Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="glpTaken" className="text-gray-700">GLP-1 Taken</Label>
                    <Input
                        id="glpTaken"
                        type="text"
                        name="glpTaken"
                        value={formData.glpTaken}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="focus-visible:ring-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="glpRecentInjection" className="text-gray-700">Date of last Injection</Label>
                    <Input
                        type="date"
                        id="glpRecentInjection"
                        name="glpRecentInjection"
                        value={formData.glpRecentInjection}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="focus-visible:ring-primary w-full"
                    />
                </div>
            </div>
        </div>
    );
};