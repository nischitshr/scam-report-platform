import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiFetch, apiUpload } from '../utils/api';
import { SCAM_TYPE_OPTIONS } from '../utils/constants';
import { FileText, Info, Paperclip } from 'lucide-react';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  scam_type: z.string().min(1, 'Please select a scam type'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be at most 2000 characters'),
  contact_used: z.string().min(1, 'Contact information is required').max(200),
});
type FormData = z.infer<typeof schema>;

export default function ReportFormPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { scam_type: '' },
  });

  const titleLen = watch('title', '').length;
  const descLen = watch('description', '').length;

  const handleFile = (f: File) => {
    setFileError('');
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(ext || '')) {
      setFileError('File must be JPG, PNG, or PDF');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFileError('File must be under 5MB');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let evidenceUrl: string | undefined;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await apiUpload<{ success: boolean; data: { file_url: string }; message: string }>('/upload/', fd);
        if (!uploadRes.success) {
          toast.error('File upload failed. Submitting without evidence.');
        } else {
          evidenceUrl = uploadRes.data.file_url;
        }
      }

      const body = { ...data, ...(evidenceUrl ? { evidence_file: evidenceUrl } : {}) };
      const res = await apiFetch('/reports/', { method: 'POST', body: JSON.stringify(body) });
      const result = await res.json();

      if (result.success) {
        toast.success('Report submitted! It will be reviewed shortly.');
        reset();
        setFile(null);
        setFilePreview(null);
        navigate('/');
      } else {
        toast.error(result.message || 'Submission failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Report a scam</h1>
          <p className="text-gray-500 text-sm mt-1">Your report will be reviewed before being published.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Scam title</label>
                <span className={`text-xs ${titleLen > 180 ? 'text-orange-500' : 'text-gray-400'}`}>{titleLen}/200</span>
              </div>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Fake job offer on LinkedIn asking for fees"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.title && <p className="mt-1.5 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            {/* Scam type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Scam type</label>
              <select
                {...register('scam_type')}
                className={`w-full px-4 py-3 rounded-xl border text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.scam_type ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              >
                <option value="" disabled>Select a category...</option>
                {SCAM_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.scam_type && <p className="mt-1.5 text-xs text-red-600">{errors.scam_type.message}</p>}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <span className={`text-xs ${descLen > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>{descLen}/2000</span>
              </div>
              <textarea
                rows={5}
                {...register('description')}
                placeholder="Describe the scam in detail: how it happened, what was promised, how you discovered it..."
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.description && <p className="mt-1.5 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            {/* Contact used */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact used by scammer</label>
              <input
                type="text"
                {...register('contact_used')}
                placeholder="Email address, phone number, website URL..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.contact_used ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.contact_used && <p className="mt-1.5 text-xs text-red-600">{errors.contact_used.message}</p>}
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Evidence (optional)</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${isDragging ? 'border-[#E03535] bg-red-50' : fileError ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
              >
                {filePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={filePreview} alt="Preview" className="max-h-32 rounded-lg object-cover" />
                    <span className="text-xs text-gray-500">{file?.name}</span>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-1">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Paperclip className="h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-[#E03535]">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, PDF — max 5MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>
              {file && (
                <button
                  type="button"
                  onClick={() => { setFile(null); setFilePreview(null); setFileError(''); if (fileRef.current) fileRef.current.value = ''; }}
                  className="mt-2 text-xs text-gray-500 hover:text-red-600 transition"
                >
                  Remove file
                </button>
              )}
              {fileError && <p className="mt-1.5 text-xs text-red-600">{fileError}</p>}
            </div>

            {/* Info note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Reports are reviewed by our admin team before being published publicly.</span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#E03535] text-white font-semibold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit report'}
              </button>
              <button
                type="button"
                onClick={() => { reset(); setFile(null); setFilePreview(null); setFileError(''); }}
                className="sm:w-32 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Clear form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
