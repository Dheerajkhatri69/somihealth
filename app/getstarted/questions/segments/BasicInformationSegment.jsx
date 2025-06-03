import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BasicInformationSegment = ({ formData, handleInputChange, handleSelectChange }) => {
  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Let&apos;s start with the Basic Information</h3>
      
      {/* Name Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First Name"
            className="focus-visible:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last Name"
            className="focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Column 1 */}
        <div className="space-y-1.5">
          <Label htmlFor="dob" className="text-gray-700">Date of Birth</Label>
          <Input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="focus-visible:ring-primary"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="sex" className="text-gray-700">Gender</Label>
          <Select
            value={formData.sex}
            onValueChange={(value) => handleSelectChange('sex', value)}
          >
            <SelectTrigger id="sex" className="focus:ring-primary">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="height" className="text-gray-700">Height</Label>
          <Input
            id="height"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            placeholder="5'9"
            className="focus-visible:ring-primary"
          />
        </div>
        
        {/* Column 2 */}
        <div className="space-y-1.5">
          <Label htmlFor="weight" className="text-gray-700">Weight (lbs)</Label>
          <Input
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="214"
            className="focus-visible:ring-primary"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="bmi" className="text-gray-700">BMI</Label>
          <Input
            id="bmi"
            name="bmi"
            value={formData.bmi}
            onChange={handleInputChange}
            placeholder="32"
            className="focus-visible:ring-primary"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="glp1" className="text-gray-700">GLP-1 Preference</Label>
          <Select
            value={formData.glp1}
            onValueChange={(value) => handleSelectChange('glp1', value)}
          >
            <SelectTrigger id="glp1" className="focus:ring-primary">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
              <SelectItem value="Semaglutide">Semaglutide</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Column 3 */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-gray-700">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@mail.com"
            className="focus-visible:ring-primary"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-gray-700">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
            className="focus-visible:ring-primary"
          />
        </div>
      </div>
    </div>
  );
};