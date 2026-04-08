import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Rocket, TestTube, Monitor } from 'lucide-react'

const SECTIONS = [
  { key: 'basic', title: 'Basic Information' },
  { key: 'contact', title: 'Contact Information' },
  { key: 'config', title: 'Client Configuration' },
  { key: 'auth', title: 'Authentication & Admin User' },
  { key: 'style', title: 'Style Configuration' },
]

const CLIENT_TYPES = [
  { key: 'prod', label: 'Prod', icon: Rocket },
  { key: 'test', label: 'Test', icon: TestTube },
  { key: 'demo', label: 'Demo', icon: Monitor },
]

function FormInput({ label, required, placeholder, half }) {
  return (
    <div className={half ? 'flex-1' : 'w-full'}>
      <label className="block text-sm text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder || ''}
        className="w-full border border-gray-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  )
}

function AccordionSection({ title, badge, isOpen, onToggle, children }) {
  return (
    <div className="border border-gray-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{title}</span>
          <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded">
            {badge || 'PENDING'}
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function CreateClientModal({ isOpen, onClose }) {
  const [activeType, setActiveType] = useState('prod')
  const [openSection, setOpenSection] = useState('basic')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-[620px] max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-border">
          <h2 className="text-lg font-semibold text-gray-900">Create New Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Client Type Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-700">Type</span>
              <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded">REQUIRED</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Choose the type of client you want to create for the platform.
            </p>
            <div className="flex gap-2">
              {CLIENT_TYPES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveType(key)}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-lg border-2 transition-colors ${
                    activeType === key
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-border hover:border-gray-400'
                  }`}
                >
                  <Icon size={28} className={activeType === key ? 'text-primary' : 'text-gray-400'} />
                  <span className={`text-xs font-medium ${activeType === key ? 'text-primary' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Accordion sections */}
          <div className="flex flex-col gap-3">
            {SECTIONS.map((section) => (
              <AccordionSection
                key={section.key}
                title={section.title}
                isOpen={openSection === section.key}
                onToggle={() => setOpenSection(openSection === section.key ? null : section.key)}
              >
                {section.key === 'basic' && (
                  <>
                    <FormInput label="Merchant Name" required placeholder="Enter name" />
                    <div className="flex gap-4">
                      <FormInput label="Country" half placeholder="Select" />
                      <FormInput label="City" half placeholder="Enter city" />
                    </div>
                    <FormInput label="Language" placeholder="Select language" />
                    <div className="flex gap-4">
                      <FormInput label="Akua Mode" half placeholder="Processor" />
                      <FormInput label="Client type" half placeholder="Select" />
                    </div>
                  </>
                )}
                {section.key === 'contact' && (
                  <>
                    <div className="flex gap-4">
                      <FormInput label="Contact Name" half placeholder="Enter name" />
                      <FormInput label="Contact Email" half placeholder="email@example.com" />
                    </div>
                    <div className="flex gap-4">
                      <FormInput label="Contact Phone" half placeholder="+1 234 567 890" />
                      <FormInput label="Contact Position" half placeholder="CTO, CEO..." />
                    </div>
                  </>
                )}
                {section.key === 'config' && (
                  <FormInput label="Tenant ID" required placeholder="Enter tenant ID" />
                )}
                {section.key === 'auth' && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                      </div>
                      <span className="text-sm text-gray-600">Enable admin user</span>
                    </div>
                    <div className="flex gap-4">
                      <FormInput label="Admin First Name" half placeholder="First name" />
                      <FormInput label="Admin Last Name" half placeholder="Last name" />
                    </div>
                  </>
                )}
                {section.key === 'style' && (
                  <>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-500">Upload logo (drag & drop or click)</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500">Favicon</p>
                      </div>
                      <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500">Icon</p>
                      </div>
                    </div>
                  </>
                )}
              </AccordionSection>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-hover">
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
