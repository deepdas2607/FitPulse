import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, X, CheckCircle2 } from 'lucide-react';
import { EmergencyContact } from '../types';

interface EmergencyAlertProps {
  emergencyContact?: EmergencyContact;
  onDismiss: () => void;
  onCallComplete?: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ 
  emergencyContact, 
  onDismiss,
  onCallComplete 
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isCalling, setIsCalling] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!callInitiated) {
      initiateCall();
    }
  }, [countdown, callInitiated]);

  const initiateCall = () => {
    setIsCalling(true);
    setCallInitiated(true);

    // Determine phone number
    const phoneNumber = emergencyContact?.phone || '911';
    const phoneNumberClean = phoneNumber.replace(/\D/g, ''); // Remove non-digits

    // Create tel: link and trigger call
    const telLink = `tel:${phoneNumberClean}`;
    
    // Try to initiate call
    window.location.href = telLink;

    // On mobile devices, this will open the dialer
    // On desktop, it might not work, so show instructions
    setTimeout(() => {
      setIsCalling(false);
      onCallComplete?.();
    }, 2000);
  };

  const handleCallNow = () => {
    initiateCall();
  };

  const handleCancel = () => {
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Emergency Detected</h2>
            <p className="text-sm text-slate-600">Voice command recognized</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-slate-700 mb-2">
            {countdown > 0 ? (
              <>
                Calling <strong>{emergencyContact?.name || 'Emergency Services'}</strong> in{' '}
                <span className="text-red-600 font-bold text-xl">{countdown}</span> seconds...
              </>
            ) : (
              <>
                {isCalling ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">📞</span>
                    Initiating call to <strong>{emergencyContact?.name || 'Emergency Services'}</strong>...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Call initiated to <strong>{emergencyContact?.name || 'Emergency Services'}</strong>
                  </span>
                )}
              </>
            )}
          </p>
          {emergencyContact && (
            <p className="text-sm text-slate-600">
              Phone: {emergencyContact.phone}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {countdown > 0 && !callInitiated && (
            <>
              <button
                onClick={handleCallNow}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          {callInitiated && (
            <button
              onClick={onDismiss}
              className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>

        {!emergencyContact && (
          <p className="text-xs text-slate-500 mt-4 text-center">
            No emergency contact set. Calling 911. Add an emergency contact in your profile settings.
          </p>
        )}
      </div>
    </div>
  );
};

export default EmergencyAlert;

