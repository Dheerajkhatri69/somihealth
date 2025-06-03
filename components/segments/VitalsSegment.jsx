import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const VitalsSegment = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Vitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="bloodPressure" className="text-gray-700">Blood Pressure</Label>
                    <Input
                        id="bloodPressure"
                        name="bloodPressure"
                        value={formData.bloodPressure}
                        onChange={handleInputChange}
                        placeholder="e.g. 120/80"
                        className="focus-visible:ring-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="heartRate" className="text-gray-700">Heart Rate</Label>
                    <Input
                        id="heartRate"
                        name="heartRate"
                        value={formData.heartRate}
                        onChange={handleInputChange}
                        placeholder="e.g. 72 bpm"
                        className="focus-visible:ring-primary"
                    />
                </div>
            </div>
        </div>
    );
};
