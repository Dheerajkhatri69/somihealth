import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AddressSegment = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Address Information</h3>
      
      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['address1', 'address2', 'city', 'state', 'zip'].map((field) => (
          <div 
            key={field} 
            className={`space-y-1.5 ${
              field === 'address1' ? 'md:col-span-2' : 
              field === 'address2' ? 'md:col-span-2' : ''
            }`}
          >
            <Label htmlFor={field} className="text-gray-700">
              {field === 'address1' ? 'Street Address' :
                field === 'address2' ? 'Address Line 2' :
                field === 'city' ? 'City' :
                field === 'state' ? 'State/Province' : 'Postal Code'}
            </Label>
            <Input
              id={field}
              name={field}
              value={formData[field]}
              onChange={handleInputChange}
              placeholder={
                field === 'address1' ? '123 Main St' :
                field === 'address2' ? 'Apt, suite, or unit' :
                field === 'city' ? 'e.g. New York' :
                field === 'state' ? 'e.g. NY' : 'e.g. 10001'
              }
              className="focus-visible:ring-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
};