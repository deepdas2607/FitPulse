import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, CheckCircle2, AlertTriangle } from 'lucide-react';
import { scanFoodLabel, evaluateFoodSuitability, NutritionInfo, DietaryGoals, DietSuitability } from '../utils/ocrScanner';

interface FoodScannerProps {
  onClose: () => void;
  dietaryGoals?: DietaryGoals;
}

const FoodScanner: React.FC<FoodScannerProps> = ({ onClose, dietaryGoals }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);
  const [suitability, setSuitability] = useState<DietSuitability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processImage(file);
  };

  const processImage = async (file: File) => {
    setScanning(true);
    setError(null);
    setProgress(0);

    try {
      const nutritionInfo = await scanFoodLabel(file, (p) => setProgress(p));
      setNutrition(nutritionInfo);

      if (dietaryGoals) {
        const suit = evaluateFoodSuitability(nutritionInfo, dietaryGoals);
        setSuitability(suit);
      }
    } catch (err) {
      setError('Failed to scan food label. Please try again with a clearer image.');
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error(err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        await processImage(file);
        stopCamera();
      }
    });
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Food Label Scanner</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!nutrition && !scanning && !cameraActive && (
            <div className="space-y-4">
              <p className="text-slate-600 text-center mb-6">
                Scan or upload a photo of a nutrition label to get instant analysis
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <Camera className="w-12 h-12 text-primary-600" />
                  <span className="font-semibold text-slate-900">Take Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <Upload className="w-12 h-12 text-primary-600" />
                  <span className="font-semibold text-slate-900">Upload Image</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {cameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl"
              />
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {scanning && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Scanning nutrition label...</p>
              <div className="mt-4 max-w-xs mx-auto">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">{Math.round(progress)}%</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {nutrition && (
            <div className="space-y-6">
              {suitability && (
                <div className={`rounded-xl p-4 border-2 ${
                  suitability.suitable
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {suitability.suitable ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">
                        {suitability.suitable ? 'Good Choice!' : 'Consider Alternatives'}
                      </h3>
                      <p className="text-sm">Suitability Score: {suitability.score}/100</p>
                    </div>
                  </div>

                  {suitability.warnings.length > 0 && (
                    <div className="mb-3">
                      <p className="font-semibold text-sm mb-2">Warnings:</p>
                      <ul className="space-y-1">
                        {suitability.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suitability.recommendations.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2">Tips:</p>
                      <ul className="space-y-1">
                        {suitability.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span>💡</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Nutrition Facts</h3>
                <div className="grid grid-cols-2 gap-4">
                  {nutrition.calories && (
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Calories</p>
                      <p className="text-2xl font-bold text-slate-900">{nutrition.calories}</p>
                    </div>
                  )}
                  {nutrition.protein && (
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Protein</p>
                      <p className="text-2xl font-bold text-slate-900">{nutrition.protein}g</p>
                    </div>
                  )}
                  {nutrition.carbs && (
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Carbs</p>
                      <p className="text-2xl font-bold text-slate-900">{nutrition.carbs}g</p>
                    </div>
                  )}
                  {nutrition.fat && (
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Fat</p>
                      <p className="text-2xl font-bold text-slate-900">{nutrition.fat}g</p>
                    </div>
                  )}
                  {nutrition.fiber && (
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Fiber</p>
                      <p className="text-2xl font-bold text-slate-900">{nutrition.fiber}g</p>
                    </div>
                  )}
                  {nutrition.sugar && (
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Sugar</p>
                      <p className="text-2xl font-bold text-slate-900">{nutrition.sugar}g</p>
                    </div>
                  )}
                </div>
                {nutrition.servingSize && (
                  <p className="text-sm text-slate-600 mt-4">Serving: {nutrition.servingSize}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setNutrition(null);
                    setSuitability(null);
                  }}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Scan Another
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodScanner;
