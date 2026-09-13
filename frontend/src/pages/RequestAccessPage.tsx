import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, User, Mail, Phone, Briefcase, Key, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft, Shield as ShieldIcon, UserCheck, Briefcase as BriefcaseIcon, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Personal Information', desc: 'Enter your details to create an account', icon: User },
  { id: 2, title: 'Account Role', desc: 'Select your requested role in SecureChain', icon: ShieldIcon },
  { id: 3, title: 'Security', desc: 'Set up your account credentials', icon: Key },
  { id: 4, title: 'Review & Submit', desc: 'Confirm your details and submit request', icon: CheckCircle },
];

const ROLE_OPTIONS = [
  {
    value: 'USER',
    label: 'Employee',
    icon: UserCheck,
    desc: 'View assigned assets, manage your digital identity, submit requests',
    details: 'Standard access for team members. Can view assigned assets and request transfers.',
  },
  {
    value: 'MANAGER',
    label: 'Manager',
    icon: BriefcaseIcon,
    desc: 'Manage assets, create transfer requests, view team activity',
    details: 'Can request asset transfers, freezes, and updates. Requires Owner approval for execution.',
  },
  {
    value: 'ADMIN',
    label: 'Owner',
    icon: Shield,
    desc: 'Full administrative control, approve/reject requests, manage users',
    details: 'Owner accounts require administrator verification. Grants full platform control.',
  },
];

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function RequestAccessPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    role: 'USER' as 'USER' | 'MANAGER' | 'ADMIN',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.full_name.trim()) {
          setError('Full name is required');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.organization.trim()) {
          setError('Organization is required');
          return false;
        }
        break;
      case 2:
        if (!formData.role) {
          setError('Please select a role');
          return false;
        }
        break;
      case 3:
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        const failedReqs = passwordRequirements.filter(r => !r.test(formData.password));
        if (failedReqs.length > 0) {
          setError('Password does not meet requirements');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;
      case 4:
        if (!formData.agreeTerms) {
          setError('You must agree to the terms and security policy');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    setError('');

    try {
      await register({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
      });
      toast.success('Access request submitted successfully');
      setCurrentStep(5);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to submit access request');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    passwordRequirements.forEach(req => {
      if (req.test(password)) score++;
    });
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <button
          className="fixed top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => navigate('/login')}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Sign In
        </button>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="font-bold text-2xl text-gray-900 mb-2">Access Request Submitted</h2>
            <p className="text-gray-600 mb-6">Your request has been securely recorded and forwarded for review.</p>

            <div className="p-4 rounded-xl bg-white border border-gray-200 text-left mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">PENDING APPROVAL</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="text-gray-900 font-medium">{formData.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-900 font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization</span>
                  <span className="text-gray-900 font-medium">{formData.organization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Role</span>
                  <span className="text-gray-900 font-medium">{ROLE_OPTIONS.find(r => r.value === formData.role)?.label}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">An administrator will review your requested role and organization access. You will be notified once the review is complete.</p>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <button
        className="fixed top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => navigate('/login')}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Sign In
      </button>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl text-gray-900">SECURECHAIN</div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">CONTROL CENTER</div>
              </div>
            </div>
          </div>

          {/* Desktop Step Indicator */}
          <div className="hidden lg:flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  index < currentStep - 1 ? 'text-green-600' : 
                  index === currentStep - 1 ? 'text-blue-600' : 
                  'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    index < currentStep - 1 ? 'bg-green-600 text-white' :
                    index === currentStep - 1 ? 'bg-blue-600 text-white' :
                    'bg-white border border-gray-300 text-gray-400'
                  }`}>
                    {index < currentStep - 1 ? <CheckCircle className="h-4 w-4" /> : step.id}
                  </div>
                  {index !== STEPS.length - 1 && (
                    <div className={`w-24 hidden sm:block h-0.5 ${
                      index < currentStep - 1 ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Step Indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:hidden">
            {STEPS.map((step, index) => (
              <div key={step.id} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 transition-all ${
                index < currentStep - 1 ? 'bg-green-100 text-green-600 border border-green-300' :
                index === currentStep - 1 ? 'bg-blue-100 text-blue-600 border border-blue-300' :
                'bg-white text-gray-400 border border-gray-300'
              }`}>
                <span className="font-medium text-sm">{step.id}</span>
                <span className="hidden sm:inline font-medium text-sm">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Step Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentStep === 1 ? 'bg-blue-100 text-blue-600' :
                  currentStep === 2 ? 'bg-blue-100 text-blue-600' :
                  currentStep === 3 ? 'bg-purple-100 text-purple-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {(() => {
                    const Icon = STEPS[currentStep - 1].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{STEPS[currentStep - 1].title}</h3>
                  <p className="text-sm text-gray-600">{STEPS[currentStep - 1].desc}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6 animate-in slide-in-from-top-2" role="alert">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 4) handleSubmit(); else handleNext(); }}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="block text-sm font-semibold text-gray-900">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="full_name"
                        type="text"
                        placeholder="e.g. Ananya Rao"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        autoComplete="name"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        autoComplete="email"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        autoComplete="tel"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="organization" className="block text-sm font-semibold text-gray-900">
                      Organization
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="organization"
                        type="text"
                        placeholder="e.g. Acme Corporation"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        autoComplete="organization"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Account Role */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <p className="text-gray-600 text-sm mb-4">Select the role that matches your responsibilities. Owner accounts require administrator verification.</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {ROLE_OPTIONS.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => { handleInputChange('role', role.value); setError(''); }}
                        className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left h-full ${
                          formData.role === role.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            formData.role === role.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <role.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{role.label}</div>
                            <div className="text-xs text-gray-600">{role.desc}</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{role.details}</p>
                        {formData.role === role.value && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Security */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        autoComplete="new-password"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    {!formData.password && (
                      <p className="text-xs text-gray-500">Must meet all requirements below</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        autoComplete="new-password"
                        required
                        className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Password Strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 2 ? 'text-red-600' :
                        passwordStrength <= 4 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength === 0 ? 'Very Weak' : passwordStrength <= 2 ? 'Weak' : passwordStrength <= 4 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength <= 2 ? 'bg-red-500' :
                          passwordStrength <= 4 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                            req.test(formData.password) ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-400'
                          }`}>
                            {req.test(formData.password) && <CheckCircle className="h-3 w-3" />}
                          </span>
                          <span className={`${req.test(formData.password) ? 'text-gray-600' : 'text-gray-400'}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Please review your information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Full Name</span>
                        <span className="text-gray-900 font-medium">{formData.full_name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Email</span>
                        <span className="text-gray-900 font-medium">{formData.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Phone</span>
                        <span className="text-gray-900 font-medium">{formData.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Organization</span>
                        <span className="text-gray-900 font-medium">{formData.organization}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Requested Role</span>
                        <span className="text-gray-900 font-medium">{ROLE_OPTIONS.find(r => r.value === formData.role)?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium text-yellow-700 mb-1">Owner Role Requires Verification</p>
                        <p>If you selected <strong>Owner</strong>, your account will require administrator verification before access is granted. You will be notified once the review is complete.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                      />
                      <div className="text-sm text-gray-600">
                        I agree to the <a href="#" className="text-blue-600 hover:underline">SecureChain Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Security Policy</a>.
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex gap-3">
                  {currentStep < 4 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {currentStep === 4 && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Access Request
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
