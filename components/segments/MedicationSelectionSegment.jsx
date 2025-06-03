import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export const MedicationSelectionSegment = ({ formData, handleSelectChange }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Medication Selection</h3>
            <div className="space-y-1.5">
                <Label htmlFor="medicine" className="text-gray-700">Medication</Label>
                <Select
                    value={formData.medicine}
                    onValueChange={(value) => handleSelectChange('medicine', value)}
                >
                    <SelectTrigger id="medicine" className="focus:ring-primary">
                        <SelectValue placeholder="Select medication" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                        <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};