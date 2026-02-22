export function Textarea({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  ...props 
}) {
  const currentLength = value?.length || 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-2.5 rounded-lg border 
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-black focus:ring-black'
          }
          focus:outline-none focus:ring-2 focus:ring-opacity-20
          resize-y
          transition-colors
        `}
        {...props}
      />
      {showCharCount && maxLength && (
        <p className="mt-1 text-sm text-gray-500 text-right">
          {currentLength} / {maxLength}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
