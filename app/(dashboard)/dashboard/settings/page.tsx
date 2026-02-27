'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  CreditCard, 
  Globe,
  Shield,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    smsAppointments: true,
    emailPrescriptions: true,
    smsPrescriptions: false,
    emailReports: true,
    smsReports: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Notification preferences saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notifications:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-green-600 mr-3" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Profile Information</h2>
                  <p className="text-sm text-gray-600">Update your personal information</p>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="+254 712 345 678"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Security Settings</h2>
                  <p className="text-sm text-gray-600">Manage your password and security preferences</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Shield className="h-5 w-5" />
                    <span>{isSaving ? 'Changing...' : 'Change Password'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Notification Preferences</h2>
                  <p className="text-sm text-gray-600">Choose how you want to receive updates</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Appointments</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive appointment reminders via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailAppointments}
                          onChange={(e) => setNotifications({ ...notifications, emailAppointments: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-sm text-gray-600">Receive appointment reminders via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.smsAppointments}
                          onChange={(e) => setNotifications({ ...notifications, smsAppointments: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Billing & Subscription</h2>
                  <p className="text-sm text-gray-600">Manage your subscription and payment methods</p>
                </div>

                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Basic Plan</h3>
                      <p className="text-sm text-gray-600">Pay as you go</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">Access to all CHWs and medical records storage</p>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Preferences</h2>
                  <p className="text-sm text-gray-600">Customize your experience</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                      <option value="Africa/Lagos">West Africa Time (WAT)</option>
                      <option value="Africa/Johannesburg">South Africa Time (SAST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
