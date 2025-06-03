import { Label } from '@/components/ui/label';

export const CommentsSegment = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Additional Comments</h3>
      
      {/* Textarea Field */}
      <div className="space-y-1.5">
        <Label htmlFor="providerComments" className="text-gray-700">
          Questions or Notes for Provider
        </Label>
        <textarea
          id="providerComments"
          name="providerComments"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors min-h-[120px]"
          rows={5}
          value={formData.providerComments}
          onChange={handleInputChange}
          placeholder="Enter any additional questions, notes, or special requests..."
        />
        <p className="text-sm text-gray-500 mt-1">
          This information will be shared directly with your healthcare provider.
        </p>
      </div>
    </div>
  );
};