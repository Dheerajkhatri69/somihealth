import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const MedicalHistorySegment = ({ formData, handleSelectChange, handleInputChange }) => {
  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Medical History</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {['takingMedication', 'medicineAllergy', 'majorSurgeries', 'bariatricSurgery', 'thyroidCancerHistory'].map((field) => (
          <div key={field} className="space-y-1.5">
            <Label htmlFor={field} className="text-gray-700">
              {field === 'takingMedication' ? 'Taking Medication' :
                field === 'medicineAllergy' ? 'Medicine Allergy' :
                field === 'majorSurgeries' ? 'Major Surgeries' :
                field === 'bariatricSurgery' ? 'Bariatric Surgery (last 18 months)' :
                'Family History of Thyroid Cancer'}
            </Label>
            <Select
              value={formData[field]}
              onValueChange={(value) => handleSelectChange(field, value)}
            >
              <SelectTrigger id={field} className="focus:ring-primary">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        {['listAllMedication', 'allergyList', 'surgeryList', 'disqualifiers'].map((field) => (
          <div key={field} className="space-y-1.5">
            <Label htmlFor={field} className="text-gray-700">
              {field === 'listAllMedication' ? 'List All Medication' :
                field === 'allergyList' ? 'Allergy List' :
                field === 'surgeryList' ? 'Surgery List' :
                'Disqualifiers'}
            </Label>
            <Textarea
              id={field}
              name={field}
              value={formData[field]}
              onChange={handleInputChange}
              placeholder={
                field === 'listAllMedication' ? 'List known medication...' :
                field === 'allergyList' ? 'List known allergies...' :
                field === 'surgeryList' ? 'List of major surgeries...' :
                'Mention any disqualifiers...'
              }
              className="focus-visible:ring-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
};