import React, { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { journalAPI } from '@/utils/api';
import { useRouter } from 'next/router';

interface JournalAuthor {
  name: string;
  email: string;
  department: string;
  isPrimary: boolean;
}

interface JournalSubmissionFormData {
  title: string;
  abstract: string;
  authors: JournalAuthor[];
}

const JournalSubmissionForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journalFile, setJournalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit,
    control,
    formState: { errors } 
  } = useForm<JournalSubmissionFormData>({
    defaultValues: {
      authors: [{ name: '', email: '', department: '', isPrimary: true }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "authors"
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const fileType = file.type;
      if (fileType !== 'application/pdf' && fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setError('Only PDF and DOCX files are allowed');
        setJournalFile(null);
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setJournalFile(null);
        return;
      }
      
      setJournalFile(file);
      setError(null);
    }
  };

  const onSubmit = async (data: JournalSubmissionFormData) => {
    try {
      if (!journalFile) {
        setError('Please upload your journal file');
        return;
      }
      
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('abstract', data.abstract);
      formData.append('journalFile', journalFile);
      formData.append('authors', JSON.stringify(data.authors));
      
      console.log('Submitting journal with data:', {
        title: data.title,
        abstract: data.abstract.substring(0, 30) + '...',
        fileName: journalFile.name,
        fileSize: journalFile.size,
        authors: data.authors.length
      });
      
      const response = await journalAPI.createJournal(formData);
      
      console.log('Journal submission successful:', response);
      
      // Redirect to journal details page
      if (response && response.journal && response.journal.id) {
        router.push(`/journals/${response.journal.id}`);
      } else {
        console.error('Invalid response format:', response);
        setError('Received invalid response from server');
      }
    } catch (error: any) {
      console.error('Journal submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit journal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" space-y-6">
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <div>
        <label htmlFor="title" className="form-label">
          Journal Title
        </label>
        <input
          id="title"
          type="text"
          className={`form-input ${errors.title ? 'border-red-500' : ''}`}
          {...register('title', { 
            required: 'Title is required'
          })}
        />
        {errors.title && (
          <p className="form-error">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="abstract" className="form-label">
          Abstract
        </label>
        <textarea
          id="abstract"
          rows={5}
          className={`form-input ${errors.abstract ? 'border-red-500' : ''}`}
          {...register('abstract', { 
            required: 'Abstract is required',
            minLength: {
              value: 100,
              message: 'Abstract should be at least 100 characters'
            }
          })}
        />
        {errors.abstract && (
          <p className="form-error">{errors.abstract.message}</p>
        )}
      </div>

      <div>
        <label className="form-label">Authors</label>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">
                  Author {index + 1} {index === 0 ? '(Primary)' : ''}
                </h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.authors?.[index]?.name ? 'border-red-500' : ''}`}
                    {...register(`authors.${index}.name` as const, { 
                      required: 'Author name is required'
                    })}
                  />
                  {errors.authors?.[index]?.name && (
                    <p className="form-error">{errors.authors?.[index]?.name?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    {...register(`authors.${index}.email` as const)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register(`authors.${index}.department` as const)}
                  />
                </div>
                
                <input
                  type="hidden"
                  {...register(`authors.${index}.isPrimary` as const)}
                  value={index === 0 ? 'true' : 'false'}
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', email: '', department: '', isPrimary: false })}
          >
            Add Another Author
          </Button>
        </div>
      </div>

      <div>
        <label className="form-label">Journal File</label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {journalFile ? 'Change File' : 'Upload File'}
            </Button>
            {journalFile && (
              <span className="ml-2 text-sm text-gray-600">
                {journalFile.name}
              </span>
            )}
            <p className="mt-1 text-sm text-gray-500">
              PDF or DOCX. Max size 10MB.
            </p>
          </div>
        </div>
      </div>

      <div>
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          isLoading={isSubmitting}
        >
          Submit Journal
        </Button>
      </div>
    </form>
  );
};

export default JournalSubmissionForm;
