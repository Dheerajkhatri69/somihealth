import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const DiagnosisSegment = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Diagnosis</h3>
            <div className="space-y-1.5">
                <Label htmlFor="diagnosis" className="text-gray-700">Diagnosis Notes</Label>
                <Textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Enter patient diagnosis, symptoms, or relevant notes..."
                    className="focus-visible:ring-primary"
                />
            </div>
        </div>
    );
};
