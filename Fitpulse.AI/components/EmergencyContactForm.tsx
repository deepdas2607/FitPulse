import React, { useState } from 'react';
import { Phone, User, Save, AlertCircle } from 'lucide-react';
import { updateUserProfile } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyContact } from '../types';

interface EmergencyContactFormProps {
  currentContact?: EmergencyContact;
  onSave?: () => void;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({ currentContact, onSave }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: currentContact?.name || '',
    phone: currentContact?.phone || '',
    relationship: currentContact?.relationship || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to save emergency contact');
      return;
    }

    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateUserProfile(user.uid, {
        emergencyContact: {
          name: formData.name,
          phone: formData.phone,
          relationship: formData.relationship || undefined,
        },
      });

      setSuccess(true);
      onSave?.();
      
      // Reload page to update profile in context
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving emergency contact:', err);
      setError(err?.message || 'Failed to save emergency contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
          Contact Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="relationship" className="block text-sm font-semibold text-slate-700 mb-2">
          Relationship (Optional)
        </label>
        <input
          type="text"
          id="relationship"
          value={formData.relationship}
          onChange={handleChange}
          placeholder="Spouse, Parent, Friend, etc."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Emergency contact saved successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />
        {isLoading ? 'Saving...' : 'Save Emergency Contact'}
      </button>

      <p className="text-xs text-slate-500 text-center">
        This contact will be called automatically if you say "Help" or "Emergency" during a workout.
      </p>
    </form>
  );
};

export default EmergencyContactForm;

