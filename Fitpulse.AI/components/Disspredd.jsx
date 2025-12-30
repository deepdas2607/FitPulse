
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from "../firebase/config";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Stethoscope, Activity, Phone, User, Globe, Check, AlertCircle } from 'lucide-react';

const DisPred = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isSeriousDisease, setIsSeriousDisease] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      const user = auth.currentUser;
      if (user) {
        // Fetch family members
        const familyQuery = query(
          collection(db, "medicalForms"),
          where("userId", "==", user.uid)
        );
        const familySnapshot = await getDocs(familyQuery);
        const members = [];
        familySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.familyMembers) {
            members.push(...data.familyMembers);
          }
        });
        setFamilyMembers(members);

        // Fetch doctors (mock data for now)
        setDoctors([
          { name: 'Dr. Smith', phone: '+1234567890', specialty: 'General Physician' },
          { name: 'Dr. Johnson', phone: '+0987654321', specialty: 'Emergency Care' }
        ]);
      }
    };

    fetchContacts();
  }, []);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSymptoms(prev => [...prev, value]);
    } else {
      setSymptoms(prev => prev.filter(symptom => symptom !== value));
    }
  };

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber} `;
  };

  const handlePredict = async () => {
    if (symptoms.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setPrediction(data.disease);
      // Simple logic for seriousness based on disease name for now if not provided
      setIsSeriousDisease(data.serious || ['Heart Condition', 'Pneumonia', 'Severe Viral Infection'].includes(data.disease));

      // Scroll to prediction
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction("Error generating prediction. Please ensure the backend server is running.");
      setIsSeriousDisease(false);
    } finally {
      setIsLoading(false);
    }
  };

  const symptomOptions = [
    { value: "fever", label: "Fever", description: "Elevated body temperature above normal (98.6°F/37°C)" },
    { value: "cough", label: "Cough", description: "Sudden, forceful expulsion of air from the lungs" },
    { value: "sore throat", label: "Sore Throat", description: "Pain, scratchiness or irritation of the throat" },
    { value: "headache", label: "Headache", description: "Pain in any region of the head" },
    { value: "body pain", label: "Body Pain", description: "Generalized pain or discomfort throughout the body" },
    { value: "fatigue", label: "Fatigue", description: "Feeling of tiredness or lack of energy" },
    { value: "breathing difficulty", label: "Breathing Difficulty", description: "Difficulty breathing or feeling breathless" },
    { value: "chest pain", label: "Chest Pain", description: "Pain or discomfort in the chest area" },
    { value: "nausea", label: "Nausea", description: "Unpleasant sensation of wanting to vomit" },
    { value: "vomiting", label: "Vomiting", description: "Forceful expulsion of stomach contents through the mouth" },
    { value: "diarrhea", label: "Diarrhea", description: "Frequent, loose, or watery bowel movements" },
    { value: "loss of taste", label: "Loss of Taste", description: "Reduced or absent ability to taste food" },
    { value: "loss of smell", label: "Loss of Smell", description: "Inability to perceive odors" },
    { value: "runny nose", label: "Runny Nose", description: "Excess drainage produced by nasal tissues" },
    { value: "congestion", label: "Congestion", description: "Nasal stuffiness remaining from swollen tissues" },
    { value: "muscle pain", label: "Muscle Pain", description: "Pain localized in the muscles" },
    { value: "joint pain", label: "Joint Pain", description: "Discomfort or pain in joints" },
    { value: "rash", label: "Rash", description: "Change in the color or texture of the skin" },
    { value: "loss of appetite", label: "Loss of Appetite", description: "Reduced desire to eat" },
    { value: "weakness", label: "Weakness", description: "Reduced physical strength" },
    { value: "dizziness", label: "Dizziness", description: "Sensation of spinning or losing balance" },
    { value: "chills", label: "Chills", description: "Feeling cold with shivering" },
    { value: "sweating", label: "Sweating", description: "Excessive perspiration" },
    { value: "abdominal pain", label: "Abdominal Pain", description: "Pain between the chest and groin" },
    { value: "blurred vision", label: "Blurred Vision", description: "Lack of sharpness of vision" },
    // Gym / Workout Related
    { value: "muscle cramps", label: "Muscle Cramps", description: "Sudden, involuntary contraction of one or more muscles" },
    { value: "joint stiffness", label: "Joint Stiffness", description: "Sensation of difficulty moving a joint or the perceived loss of range of motion" },
    { value: "lower back pain", label: "Lower Back Pain", description: "Pain in the lumbar region, often after lifting" },
    { value: "shin splints", label: "Shin Splints", description: "Pain along the shin bone (tibia)" },
    { value: "dehydration", label: "Dehydration", description: "Excessive loss of body water" },
    { value: "excessive fatigue", label: "Excessive Fatigue", description: "Extreme tiredness resulting from mental or physical exertion or illness" },
    { value: "rotator cuff pain", label: "Rotator Cuff Pain", description: "Pain in the shoulder, common in overhead lifting" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32">
      {/* Navigation Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link
          to="/dashboard/health"
          className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors bg-slate-100 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-100 px-3 py-1.5 rounded-full">
          <Globe className="w-4 h-4" />
          <span>English</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-indigo-700 text-white px-6 py-12 md:py-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 mb-2">
            <Activity className="w-4 h-4" />
            AI-Powered Health Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Check Your Symptoms
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
            Select the symptoms you are experiencing below to receive a preliminary health assessment powered by our advanced AI model.
          </p>

          {/* Disclaimer Banner in Hero */}
          <div className="mt-6 mx-auto max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 text-sm text-blue-50 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-yellow-300" />
            <p>
              <strong>Important Note:</strong> This tool provides predictions based on AI analysis. It is <u>not</u> a medical diagnosis. Always consult a qualified doctor for professional advice, especially for severe or persistent symptoms.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary-600" />
            Select Symptoms ({symptoms.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {symptomOptions.map(({ value, label, description }) => (
              <label
                key={value}
                className={`
                  group relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none
                  ${symptoms.includes(value)
                    ? 'bg-primary-50 border-primary-500 shadow-md transform -translate-y-0.5'
                    : 'bg-white border-slate-100 shadow-sm hover:border-primary-200 hover:shadow-md'
                  }
`}
              >
                <div className="pt-1">
                  <div className={`
w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                    ${symptoms.includes(value)
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-slate-300 group-hover:border-primary-400'
                    }
`}>
                    {symptoms.includes(value) && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <input
                    type="checkbox"
                    value={value}
                    checked={symptoms.includes(value)}
                    onChange={handleCheckboxChange}
                    className="hidden" // Hiding default checkbox for custom style
                  />
                </div>
                <div>
                  <span className={`block text-lg font-bold mb-1 transition-colors ${symptoms.includes(value) ? 'text-primary-900' : 'text-slate-800'
                    } `}>
                    {label}
                  </span>
                  <span className={`text-sm leading-relaxed transition-colors ${symptoms.includes(value) ? 'text-primary-700' : 'text-slate-500'
                    } `}>
                    {description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <button
            onClick={handlePredict}
            className={`
              w-full py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 
              transition-all flex items-center justify-center gap-3 text-lg
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
            disabled={isLoading || symptoms.length === 0}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Stethoscope className="w-6 h-6" />
                Predict Disease
              </>
            )}
          </button>
        </div>

        {prediction && (
          <div id="prediction-result" className={`mt-8 rounded-2xl border p-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ${isSeriousDisease
            ? 'bg-red-50 border-red-200 shadow-lg shadow-red-100/50'
            : 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-100/50'
            } `}>

            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full mb-6 ${isSeriousDisease ? 'bg-white text-red-600 shadow-md' : 'bg-white text-emerald-600 shadow-md'
                } `}>
                {isSeriousDisease ? <AlertCircle className="w-10 h-10" /> : <Activity className="w-10 h-10" />}
              </div>

              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-70">Analysis Complete</h2>
              <div className={`text-5xl font-extrabold mb-6 ${isSeriousDisease ? 'text-red-700' : 'text-emerald-700'
                } `}>
                {prediction}
              </div>

              <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
                Based on your symptoms ({symptoms.join(', ')}), our AI indicates a high probability of
                <strong className={isSeriousDisease ? 'text-red-700' : 'text-emerald-700'}> {prediction}</strong>.
                {isSeriousDisease && " This is a serious condition that requires immediate professional medical attention."}
              </p>
            </div>

            {isSeriousDisease && (
              <div className="mt-10 bg-white rounded-2xl p-6 md:p-8 border border-red-100 shadow-sm max-w-3xl mx-auto">
                <h4 className="text-lg font-bold text-red-800 mb-6 flex items-center justify-center gap-2 border-b border-red-50 pb-4">
                  <Phone className="w-5 h-5" />
                  Recommended Actions: Contact Medical Support
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {familyMembers.map((member, index) => (
                    <button
                      key={index}
                      className="px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-3 shadow-sm"
                      onClick={() => handleCall(member.phone)}
                    >
                      <User className="w-5 h-5" />
                      Call {member.name}
                    </button>
                  ))}
                  {doctors.map((doctor, index) => (
                    <button
                      key={`doctor-${index}`}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition-all flex items-center gap-3 transform hover:-translate-y-0.5"
                      onClick={() => handleCall(doctor.phone)}
                    >
                      <Stethoscope className="w-5 h-5" />
                      Call {doctor.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 text-center bg-white/50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-normal">
                <strong>Medical Disclaimer:</strong> This prediction is generated by AI algorithms and is intended for informational/educational purposes only. It is <u>not</u> a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical condition.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex justify-center">
        <div className="max-w-4xl w-full flex items-center justify-between gap-4">
          <div className="hidden md:block">
            <span className="text-slate-500 font-medium">Selected:</span>
            <span className="ml-2 text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-lg">{symptoms.length} symptoms</span>
          </div>

          <button
            onClick={handlePredict}
            className={`
              flex-1 md:flex-none md:w-96 py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 
              transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 text-lg
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
            `}
            disabled={isLoading || symptoms.length === 0}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="w-6 h-6" />
                {symptoms.length === 0 ? 'Select Symptoms to Predict' : `Analyze ${symptoms.length} Symptoms`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisPred;

