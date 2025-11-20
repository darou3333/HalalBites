import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, FileText, Award, Upload as UploadIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { userService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
    setLoading(false);
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!user?.id) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }

    // Validate username not empty
    if (!username.trim()) {
      setError('Username is required');
      setSaving(false);
      return;
    }

    try {
      await userService.updateProfile({
        username: username.trim(),
        bio: bio.trim(),
        specialty: specialty.trim(),
        profile_image: profileImage || undefined,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-fuchsia-400/15 dark:bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-400/15 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-all group ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Back to dashboard</span>
        </button>

        {/* Header */}
        <div className={`mb-8 sm:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-neutral-900 dark:text-white mb-2 md:mb-3 tracking-tight">
            Edit Profile
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400">
            Customize your profile and let the community know more about you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image */}
          <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">Profile Picture</h2>
            
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-12 text-center hover:border-green-500 dark:hover:border-green-400 transition-all bg-stone-50 dark:bg-neutral-800">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-40 h-40 mx-auto rounded-2xl object-cover shadow-2xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImagePreview(null);
                      setProfileImage('');
                    }}
                    className="mt-6 border-2 border-neutral-300 dark:border-neutral-700 rounded-2xl px-6 py-5"
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div>
                  <UploadIcon className="w-16 h-16 mx-auto mb-4 text-neutral-400 dark:text-neutral-500" />
                  <label htmlFor="profileImage" className="cursor-pointer">
                    <span className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-lg">
                      Click to upload
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400 text-lg"> or drag and drop</span>
                  </label>
                  <p className="text-neutral-500 dark:text-neutral-500 mt-2">
                    PNG, JPG up to 10MB
                  </p>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">Basic Information</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-base md:text-lg">Username *</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className="pl-12 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-12 md:h-14 text-base md:text-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base md:text-lg">Email (Read-only)</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="pl-12 bg-stone-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-12 md:h-14 text-base md:text-lg text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">About You</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-base md:text-lg flex items-center gap-2 text-neutral-900 dark:text-white">
                  <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself... (optional)"
                  rows={4}
                  className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl text-base md:text-lg resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="specialty" className="text-base md:text-lg flex items-center gap-2 text-neutral-900 dark:text-white">
                  <Award className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  Specialty
                </Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g., Pakistani Cuisine, Grilling Expert, etc. (optional)"
                  className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-12 md:h-14 text-base md:text-lg"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1 border-2 border-neutral-300 dark:border-neutral-700 rounded-2xl py-5 sm:py-6 text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white disabled:cursor-not-allowed shadow-lg hover:shadow-xl rounded-2xl py-5 sm:py-6 text-sm sm:text-base md:text-lg transition-all hover:scale-105"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
