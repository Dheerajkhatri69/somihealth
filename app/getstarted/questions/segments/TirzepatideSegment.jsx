import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export const TirzepatideSegment = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Tirzepatide Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['tirzepetideLastDose', 'tirzepetideRequestedDose'].map((field) => (
                    <div key={field} className="space-y-1.5">
                        <Label htmlFor={field} className="text-gray-700">
                            {field === 'tirzepetideLastDose' ? 'Last Dose' : 'Requested Dose'}
                        </Label>
                        <Input
                            id={field}
                            name={field}
                            type="text"
                            value={formData[field]}
                            onChange={handleInputChange}
                            placeholder="Enter dose"
                            className="focus-visible:ring-primary"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};