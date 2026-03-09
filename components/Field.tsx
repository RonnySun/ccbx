interface InputProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: "text" | "number" | "date";
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function Field({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  required,
  className = "",
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextArea({ label, value, onChange, placeholder, rows = 2, className = "" }: TextAreaProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    </div>
  );
}
