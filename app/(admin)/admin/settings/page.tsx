'use client';

import { useState } from 'react';
import { Settings, Bell, DollarSign, Shield, Mail, Globe, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformFee: 10,
    minAppointmentCost: 1000,
    maxAppointmentCost: 10000,
    emailNotifications: true,
    smsNotifications: true,
    maintenanceMode: false,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform-wide settings</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Platform settings are not yet wired to the backend — changes below are not saved.
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
          Payment Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Fee (%)
            </label>
            <input
              type="number"
              value={settings.platformFee}
              onChange={(e) => setSettings({ ...settings, platformFee: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Appointment Cost (KES)
            </label>
            <input
              type="number"
              value={settings.minAppointmentCost}
              onChange={(e) => setSettings({ ...settings, minAppointmentCost: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Appointment Cost (KES)
            </label>
            <input
              type="number"
              value={settings.maxAppointmentCost}
              onChange={(e) => setSettings({ ...settings, maxAppointmentCost: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Bell className="h-5 w-5 text-purple-600 mr-2" />
          Notification Settings
        </h2>
        
        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-600">Send system notifications via email</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </label>
        
        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">SMS Notifications</p>
            <p className="text-sm text-gray-600">Send system notifications via SMS</p>
          </div>
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </label>
      </div>

      {/* System */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Shield className="h-5 w-5 text-purple-600 mr-2" />
          System Settings
        </h2>
        
        <label className="flex items-center justify-between p-4 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50">
          <div>
            <p className="font-medium text-gray-900">Maintenance Mode</p>
            <p className="text-sm text-gray-600">Disable platform for maintenance</p>
          </div>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed flex items-center space-x-2"
          disabled
          title="Not yet available — platform settings persistence is not built yet"
        >
          <Save className="h-5 w-5" />
          <span>Save Settings (Coming Soon)</span>
        </button>
      </div>
    </div>
  );
}