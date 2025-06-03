import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TirzepatideDetailsSegment = ({ formData, handleInputChange, handleSelectChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Tirzepatide Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['tirzepetidePlanPurchased', 'tirzepetideVial'].map((field) => (
                    <div key={field} className="space-y-1.5">
                        <Label htmlFor={field} className="text-gray-700">
                            {field === 'tirzepetidePlanPurchased' ? 'Plan Purchased' : 'Vial'}
                        </Label>
                        <Input
                            id={field}
                            name={field}
                            type="text"
                            value={formData[field]}
                            onChange={handleInputChange}
                            placeholder={`Enter ${field === 'tirzepetidePlanPurchased' ? 'plan' : 'vial'}`}
                            className="focus-visible:ring-primary"
                        />
                    </div>
                ))}
                <div className="space-y-1.5">
                    <Label htmlFor="tirzepetideDosingSchedule" className="text-gray-700">Dosing Schedule</Label>
                    <Select
                        value={formData.tirzepetideDosingSchedule}
                        onValueChange={(value) => handleSelectChange('tirzepetideDosingSchedule', value)}
                    >
                        <SelectTrigger id="tirzepetideDosingSchedule" className="focus:ring-primary">
                            <SelectValue placeholder="Select dosing schedule" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Biweekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};